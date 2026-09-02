import { z } from 'zod';

import { CHAIN_LIST, type CHAIN_ID } from './chains';

/**
 * THE single source of truth for frontend runtime ENVs (runtime injected)
 *
 *  - `MANIFEST` - describes the raw env var sources, transforms and final shape
 *  - `buildClientEnv()` run by `window-env-cli`, reads and sanitizes raw env vars and secrets(presence check)
 *     and produces the final shape, validated by zod
 *  - `parseClientEnv()` run by the browser, parses and verifies JSON injected into HTML by nginx SSI
 *
 */

type RawEnv = Record<string, string | undefined>;

const asString = (val: unknown): string | undefined =>
  typeof val === 'string' ? val : undefined;

const toBoolean = (val: unknown): boolean => {
  const s = asString(val);
  return !!s && (s.toLowerCase() === 'true' || parseInt(s, 10) === 1);
};

const toNumber =
  (fallback: number) =>
  (val: unknown): number => {
    const s = asString(val);
    const n = s === undefined ? NaN : parseInt(s, 10);
    return Number.isFinite(n) ? n : fallback;
  };

const toNumberList =
  (fallback: readonly number[]) =>
  (val: unknown): number[] => {
    const s = asString(val);
    if (!s) return [...fallback];
    return s
      .split(',')
      .map((part) => parseInt(part.trim(), 10))
      .filter((n) => Number.isFinite(n));
  };

const toStringList = (val: unknown): string[] => {
  const s = asString(val);
  return s
    ? s
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    : [];
};

const withFallback =
  (fallback: string) =>
  (val: unknown): string =>
    asString(val) || fallback;

// Empty string ≠ undefined for keys like manifestOverride:
// `getManifestKey(N, '')` would produce `"N-"` and break the lookup.
const toOptionalString = (val: unknown): string | undefined =>
  asString(val) || undefined;

type RPC_MAP = {
  [chainId in CHAIN_ID]: string[];
};

/** One manifest entry: where the raw value comes from (`source`: an env
 * var name, or a function for values assembled from several vars), the
 * `transform` producing the final value, and the zod `shape` of that final
 * value — the piece both ends validate against. */
const entry = <S extends z.ZodType>(
  source: string | ((env: RawEnv) => unknown),
  transform: (raw: unknown) => z.input<S>,
  shape: S,
) => ({ source, transform, shape });

const optionalString = z.string().optional();

const MANIFEST = {
  ipfsMode: entry('IPFS_MODE', toBoolean, z.boolean()),
  isProd: entry('IS_PROD', toBoolean, z.boolean()),
  selfOrigin: entry(
    'SELF_ORIGIN',
    withFallback('https://stake.lido.fi'),
    z.string(),
  ),
  rootOrigin: entry('ROOT_ORIGIN', withFallback('https://lido.fi'), z.string()),
  docsOrigin: entry(
    'DOCS_ORIGIN',
    withFallback('https://docs.lido.fi'),
    z.string(),
  ),
  helpOrigin: entry(
    'HELP_ORIGIN',
    withFallback('https://help.lido.fi'),
    z.string(),
  ),
  researchOrigin: entry(
    'RESEARCH_ORIGIN',
    withFallback('https://research.lido.fi'),
    z.string(),
  ),
  blogOrigin: entry(
    'BLOG_ORIGIN',
    withFallback('https://blog.lido.fi'),
    z.string(),
  ),
  // Keep fallbacks as in 'config/get-secret-config.ts'
  defaultChain: entry('DEFAULT_CHAIN', toNumber(560048), z.number().int()),
  supportedChains: entry(
    'SUPPORTED_CHAINS',
    toNumberList([560048]),
    z.array(z.number().int()),
  ),
  manifestOverride: entry(
    'MANIFEST_OVERRIDE',
    toOptionalString,
    optionalString,
  ),
  enableQaHelpers: entry('ENABLE_QA_HELPERS', toBoolean, z.boolean()),
  walletconnectProjectId: entry(
    'WALLETCONNECT_PROJECT_ID',
    toOptionalString,
    optionalString,
  ),
  matomoHost: entry('MATOMO_URL', toOptionalString, optionalString),
  ethAPIBasePath: entry('ETH_API_BASE_PATH', toOptionalString, optionalString),
  wqAPIBasePath: entry('WQ_API_BASE_PATH', toOptionalString, optionalString),
  rewardsBackendBasePath: entry(
    'REWARDS_BACKEND_BASE_PATH',
    toOptionalString,
    optionalString,
  ),
  devnetOverrides: entry('DEVNET_OVERRIDES', toOptionalString, optionalString),
  // presence-only flags: the browser gets true/false, never the value —
  // these paths are api-pod filesystem details / internal endpoints
  addressApiValidationEnabled: entry(
    'VALIDATION_SERVICE_BASE_PATH',
    Boolean,
    z.boolean(),
  ),
  useValidationFile: entry('VALIDATION_FILE_PATH', Boolean, z.boolean()),
  useConfigManifestFile: entry('CONFIG_MANIFEST_PATH', Boolean, z.boolean()),
  prefillUnsafeElRpcUrls: entry(
    (env) =>
      Object.fromEntries(
        CHAIN_LIST.map((chainId) => [
          chainId,
          env[`PREFILL_UNSAFE_EL_RPC_URLS_${chainId}`],
        ]),
      ),
    (raw) =>
      Object.fromEntries(
        Object.entries(raw as Record<string, unknown>).map(
          ([chainId, urls]) => [chainId, toStringList(urls)],
        ),
      ),
    z
      .record(z.string(), z.array(z.string()))
      .transform((map) => map as RPC_MAP),
  ),
} as const;

type ManifestShape = {
  [K in keyof typeof MANIFEST]: (typeof MANIFEST)[K]['shape'];
};

const CLIENT_ENV_SCHEMA = z
  .object(
    Object.fromEntries(
      Object.entries(MANIFEST).map(([key, { shape }]) => [key, shape]),
    ) as ManifestShape,
  )
  .superRefine((cfg, ctx) => {
    if (new Set(cfg.supportedChains).size !== cfg.supportedChains.length) {
      ctx.addIssue({
        code: 'custom',
        message: `supportedChains (${cfg.supportedChains}) must not contain duplicates`,
      });
    }
    if (cfg.defaultChain !== cfg.supportedChains[0]) {
      ctx.addIssue({
        code: 'custom',
        message: `defaultChain (${cfg.defaultChain}) must be the first element of supportedChains (${cfg.supportedChains})`,
      });
    }
  });

export type ClientEnv = z.infer<typeof CLIENT_ENV_SCHEMA>;

const defaultEnv = (): RawEnv =>
  typeof process !== 'undefined' && process.env ? process.env : {};

/** The exact bytes every producer puts into the window-env data element.
 * `<` is \u-escaped so no value can smuggle `</script>` (or an SSI
 * directive) into the raw-text script element; still valid, readable JSON. */
const serializeClientEnv = (clientEnv: ClientEnv): string =>
  JSON.stringify(clientEnv).replace(/</g, '\\u003C');

/** Raw env → transforms → final shape, validated. Throws (ZodError) on a
 * broken transform or invariant violation — callers are producers, where
 * failing loud is the point. */
export const buildAndSerializeClientEnv = (
  env: RawEnv = defaultEnv(),
): string =>
  serializeClientEnv(
    CLIENT_ENV_SCHEMA.parse(
      Object.fromEntries(
        Object.entries(MANIFEST).map(([key, { source, transform }]) => [
          key,
          transform(typeof source === 'string' ? env[source] : source(env)),
        ]),
      ),
    ),
  );

/** Consumer-side guardrail: validates data that claims to be ClientEnv —
 * the JSON the loader read from the window-env data element. Throws on a
 * tampered, corrupt or shape-drifted payload (fail closed). */
export const parseClientEnv = (data: unknown): ClientEnv =>
  CLIENT_ENV_SCHEMA.parse(data);
