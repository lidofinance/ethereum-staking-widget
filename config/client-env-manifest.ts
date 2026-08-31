import { z } from 'zod';

import { CHAIN_LIST, type CHAIN_ID } from './chains';

/**
 * THE single source of truth for frontend runtime env — the "one image,
 * many envs" contract. Each entry pairs the env var (or a computed source)
 * with the zod schema that transforms the raw string into its FINAL typed
 * value. Adding an entry here is the only step needed to expose a new env
 * var to the browser config.
 *
 * The window-env JSON data element carries the final shape produced by
 * `buildClientEnv()` — already transformed and validated, so the browser
 * only JSON.parses it (the fixed loader in scripts/vite/window-env-plugin.ts).
 * That gives two invariants for free:
 *  - the wire format IS the config shape (`ClientEnv = z.infer<…>`), and
 *  - only post-transform values ever ship: a presence-style flag like
 *    `useValidationFile` serializes as true/false while its source value
 *    (an api-pod file path) never reaches the browser.
 *
 * Producers of the JSON, all calling `buildClientEnv()`:
 *  - dev serve / IPFS build: scripts/vite/window-env-plugin.ts;
 *  - k8s web: scripts/window-env-cli.ts, esbuild-bundled at build and run
 *    by infra/nginx/entrypoint.sh at container boot (a config error kills
 *    the pod at boot, not in browsers) — nginx SSI splices the JSON into
 *    every HTML response;
 *  - no-window runtimes (vitest node env, the api bundle): the fallback in
 *    config/dynamics.ts.
 */

type RawEnv = Record<string, string | undefined>;

const toBoolean = (val: string | undefined): boolean =>
  !!val && (val.toLowerCase() === 'true' || parseInt(val, 10) === 1);

const toNumber =
  (fallback: number) =>
  (val: string | undefined): number => {
    const n = val === undefined ? NaN : parseInt(val, 10);
    return Number.isFinite(n) ? n : fallback;
  };

const toNumberList =
  (fallback: readonly number[]) =>
  (val: string | undefined): number[] => {
    if (!val) return [...fallback];
    return val
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));
  };

const toStringList = (val: string | undefined): string[] =>
  val
    ? val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

const withFallback =
  (fallback: string) =>
  (val: string | undefined): string =>
    val || fallback;

// Empty string ≠ undefined for keys like manifestOverride:
// `getManifestKey(N, '')` would produce `"N-"` and break the lookup.
const toOptionalString = (val: string | undefined): string | undefined =>
  val || undefined;

const envString = z.string().optional();

type RPC_MAP = {
  [chainId in CHAIN_ID]: string[];
};

/** One manifest entry: where the raw value comes from + how it becomes the
 * final typed value. `source` is an env var name, or a function for values
 * assembled from several vars (prefill RPC urls). */
const entry = <S extends z.ZodType>(
  source: string | ((env: RawEnv) => unknown),
  schema: S,
) => ({ source, schema });

const MANIFEST = {
  ipfsMode: entry('IPFS_MODE', envString.transform(toBoolean)),
  isProd: entry('IS_PROD', envString.transform(toBoolean)),
  selfOrigin: entry(
    'SELF_ORIGIN',
    envString.transform(withFallback('https://stake.lido.fi')),
  ),
  rootOrigin: entry(
    'ROOT_ORIGIN',
    envString.transform(withFallback('https://lido.fi')),
  ),
  docsOrigin: entry(
    'DOCS_ORIGIN',
    envString.transform(withFallback('https://docs.lido.fi')),
  ),
  helpOrigin: entry(
    'HELP_ORIGIN',
    envString.transform(withFallback('https://help.lido.fi')),
  ),
  researchOrigin: entry(
    'RESEARCH_ORIGIN',
    envString.transform(withFallback('https://research.lido.fi')),
  ),
  blogOrigin: entry(
    'BLOG_ORIGIN',
    envString.transform(withFallback('https://blog.lido.fi')),
  ),
  // Keep fallbacks as in 'config/get-secret-config.ts'
  defaultChain: entry('DEFAULT_CHAIN', envString.transform(toNumber(560048))),
  supportedChains: entry(
    'SUPPORTED_CHAINS',
    envString.transform(toNumberList([560048])),
  ),
  manifestOverride: entry(
    'MANIFEST_OVERRIDE',
    envString.transform(toOptionalString),
  ),
  enableQaHelpers: entry('ENABLE_QA_HELPERS', envString.transform(toBoolean)),
  walletconnectProjectId: entry(
    'WALLETCONNECT_PROJECT_ID',
    envString.transform(toOptionalString),
  ),
  matomoHost: entry('MATOMO_URL', envString.transform(toOptionalString)),
  ethAPIBasePath: entry(
    'ETH_API_BASE_PATH',
    envString.transform(toOptionalString),
  ),
  wqAPIBasePath: entry(
    'WQ_API_BASE_PATH',
    envString.transform(toOptionalString),
  ),
  rewardsBackendBasePath: entry(
    'REWARDS_BACKEND_BASE_PATH',
    envString.transform(toOptionalString),
  ),
  devnetOverrides: entry(
    'DEVNET_OVERRIDES',
    envString.transform(toOptionalString),
  ),
  // presence-only flags: the browser gets true/false, never the value —
  // these paths are api-pod filesystem details / internal endpoints
  addressApiValidationEnabled: entry(
    'VALIDATION_SERVICE_BASE_PATH',
    envString.transform(Boolean),
  ),
  useValidationFile: entry(
    'VALIDATION_FILE_PATH',
    envString.transform(Boolean),
  ),
  useConfigManifestFile: entry(
    'CONFIG_MANIFEST_PATH',
    envString.transform(Boolean),
  ),
  prefillUnsafeElRpcUrls: entry(
    (env) =>
      Object.fromEntries(
        CHAIN_LIST.map((chainId) => [
          chainId,
          env[`PREFILL_UNSAFE_EL_RPC_URLS_${chainId}`] ?? '',
        ]),
      ),
    z
      .record(z.string(), z.string().transform(toStringList))
      .transform((map) => map as RPC_MAP),
  ),
} as const;

type ManifestShape = {
  [K in keyof typeof MANIFEST]: (typeof MANIFEST)[K]['schema'];
};

export const CLIENT_ENV_SCHEMA = z
  .object(
    Object.fromEntries(
      Object.entries(MANIFEST).map(([key, { schema }]) => [key, schema]),
    ) as ManifestShape,
  )
  // Config invariants checked where the JSON is PRODUCED: at pod boot for
  // k8s (the CLI exits non-zero and the container refuses to start) and at
  // dev-server/build time locally — never first surfacing in a visitor's
  // browser.
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

/** Raw env → final validated config shape. Throws (ZodError) on invariant
 * violations — callers are producers, where failing loud is the point. */
export const buildClientEnv = (env: RawEnv = defaultEnv()): ClientEnv =>
  CLIENT_ENV_SCHEMA.parse(
    Object.fromEntries(
      Object.entries(MANIFEST).map(([key, { source }]) => [
        key,
        typeof source === 'string' ? env[source] : source(env),
      ]),
    ),
  );

/** The exact bytes every producer puts into the window-env data element.
 * `<` is \u-escaped so no value can smuggle `</script>` (or an SSI
 * directive) into the raw-text script element; still valid, readable JSON. */
export const serializeClientEnv = (clientEnv: ClientEnv): string =>
  JSON.stringify(clientEnv).replace(/</g, '\\u003C');
