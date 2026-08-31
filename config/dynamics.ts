import {
  ENV_MANIFEST,
  PREFILL_RPC_ENTRIES,
  readWindowEnv,
  type EnvEntry,
} from './client-env-manifest';
import { type CHAIN_ID } from './chains';

/**
 * Runtime env source — the "one image, many envs" contract.
 *
 * `window.__env__` is set by the fixed loader script from the window-env
 * JSON data element in the HTML (see scripts/vite/window-env-plugin.ts):
 * values arrive as RAW STRINGS keyed per config/client-env-manifest.ts, filled in
 * by nginx SSI in k8s and by the vite plugin in dev/IPFS/preview. Where
 * there is no window at all (vitest node env, the api bundle),
 * readWindowEnv() reads the same manifest straight from process.env.
 *
 * Normalize so callers see one typed shape regardless of the source.
 */

// NOTE: Window.__env__ is declared globally by @lidofinance/analytics-matomo.

const toBoolean = (val: unknown): boolean =>
  !!(
    (typeof val === 'string' && val.toLowerCase() === 'true') ||
    val === true ||
    (typeof val === 'string' && parseInt(val, 10) === 1) ||
    val === 1
  );

const toNumber = (val: unknown, fallback: number): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const n = parseInt(val, 10);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

const toNumberList = (val: unknown, fallback: readonly number[]): number[] => {
  if (Array.isArray(val)) {
    return val.map((v) => toNumber(v, 0)).filter((n) => n);
  }
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));
  }
  return [...fallback];
};

const toStringList = (val: unknown): string[] => {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string' && val.length > 0) {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const toOptionalString = (val: unknown): string | undefined =>
  // Empty string ≠ undefined for keys like manifestOverride:
  // `getManifestKey(N, '')` would produce `"N-"` and break the lookup.
  typeof val === 'string' && val.length > 0 ? val : undefined;

type RPC_MAP = {
  [chainId in CHAIN_ID]: string[];
};

// Manifest entry `type` → normalized value type.
type TypeToValue = {
  string: string;
  optionalString: string | undefined;
  boolean: boolean;
  number: number;
  numberList: number[];
  presence: boolean;
};

type DynamicsNormalized = {
  [
    K in keyof typeof ENV_MANIFEST
  ]: TypeToValue[(typeof ENV_MANIFEST)[K]['type']];
} & { prefillUnsafeElRpcUrls: RPC_MAP };

const convert = (entry: EnvEntry, raw: unknown): unknown => {
  switch (entry.type) {
    case 'string':
      return toOptionalString(raw) ?? entry.fallback;
    case 'optionalString':
      return toOptionalString(raw);
    case 'boolean':
    case 'presence':
      return toBoolean(raw);
    case 'number':
      return toNumber(raw, entry.fallback);
    case 'numberList':
      return toNumberList(raw, entry.fallback);
  }
};

const normalize = (src: Record<string, unknown>): DynamicsNormalized => {
  const get = (k: string) => src[k];

  const normalizedResult = {
    ...(Object.fromEntries(
      Object.entries(ENV_MANIFEST).map(([key, entry]) => [
        key,
        convert(entry, get(key)),
      ]),
    ) as {
      [
        K in keyof typeof ENV_MANIFEST
      ]: TypeToValue[(typeof ENV_MANIFEST)[K]['type']];
    }),
    prefillUnsafeElRpcUrls: Object.fromEntries(
      PREFILL_RPC_ENTRIES.map(({ chainId, key }) => [
        chainId,
        toStringList(get(key)),
      ]),
    ) as RPC_MAP,
  };

  if (
    new Set(normalizedResult.supportedChains).size !==
    normalizedResult.supportedChains.length
  ) {
    throw new Error(
      `Dynamics config error: supportedChains (${normalizedResult.supportedChains}) must not contain duplicates`,
    );
  }

  if (normalizedResult.defaultChain !== normalizedResult.supportedChains[0]) {
    throw new Error(
      `Dynamics config error: defaultChain (${normalizedResult.defaultChain}) must be the first element of supportedChains (${normalizedResult.supportedChains})`,
    );
  }

  return normalizedResult;
};

// Fail closed on web production builds: a missing window.__env__ means the
// window-env data element was never filled in (served outside the nginx
// SSI / preview middleware, or tampered with). The silent alternative is
// booting on the manifest's TESTNET fallbacks — worse than a hard failure.
// Dev and vitest (PROD=false) keep the fallback; IPFS builds inline the
// env statically at build time, so absence there is not a runtime
// condition.
// `?.`: the api's esbuild bundle also evaluates this module in plain Node,
// where import.meta.env does not exist at all (and the short-circuit keeps
// the vite-only __IPFS_MODE__ identifier unevaluated there).
if (
  import.meta.env?.PROD &&
  !__IPFS_MODE__ &&
  typeof window !== 'undefined' &&
  !window.__env__
) {
  throw new Error(
    'Runtime env missing: the window-env data element was not populated',
  );
}

// Don't use dynamics directly in the project!
// Only through:
// code```
//    import { config } from 'config'; // or
//    import { config } from './get-config'; // in config "namespace"
// ```
const src =
  typeof window !== 'undefined' && window.__env__
    ? (window.__env__ as unknown as Record<string, unknown>)
    : readWindowEnv();

export default normalize(src);
