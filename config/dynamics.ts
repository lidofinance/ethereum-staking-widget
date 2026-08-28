import * as dynamics from 'env-dynamics.mjs';
import { CHAIN_LIST, type CHAIN_ID } from './chains';

/**
 * Runtime env source — the "one image, many envs" contract.
 *
 * `window.__env__` is set by an inline script in the HTML itself: in k8s
 * the nginx entrypoint substitutes the index.html placeholder per
 * environment (values arrive as RAW STRINGS, or are absent); in dev serve
 * and IPFS builds `scripts/vite/window-env-plugin.ts` inlines the typed
 * env-dynamics values. Where there is no window at all (vitest node env),
 * the import of `env-dynamics.mjs` provides typed build-time defaults.
 *
 * Normalize so callers see one shape regardless of the source.
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

const toNumberList = (val: unknown, fallback: number[]): number[] => {
  if (Array.isArray(val)) {
    return val.map((v) => toNumber(v, 0)).filter((n) => n);
  }
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));
  }
  return fallback;
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

type DynamicsNormalized = typeof dynamics & {
  prefillUnsafeElRpcUrls: RPC_MAP;
};

const normalize = (src: Record<string, unknown>): DynamicsNormalized => {
  const get = (k: string) => src[k];
  const normalizedResult = {
    ipfsMode: toBoolean(get('ipfsMode')),
    selfOrigin: String(get('selfOrigin') ?? dynamics.selfOrigin),
    rootOrigin: String(get('rootOrigin') ?? dynamics.rootOrigin),
    docsOrigin: String(get('docsOrigin') ?? dynamics.docsOrigin),
    helpOrigin: String(get('helpOrigin') ?? dynamics.helpOrigin),
    researchOrigin: String(get('researchOrigin') ?? dynamics.researchOrigin),
    blogOrigin: String(get('blogOrigin') ?? dynamics.blogOrigin),
    defaultChain: toNumber(get('defaultChain'), dynamics.defaultChain),
    supportedChains: toNumberList(
      get('supportedChains'),
      dynamics.supportedChains,
    ),
    manifestOverride: toOptionalString(get('manifestOverride')),
    prefillUnsafeElRpcUrls: {
      ...Object.fromEntries(
        CHAIN_LIST.map((chainId) => [
          chainId,
          toStringList(get(`prefillUnsafeElRpcUrls${chainId}`)),
        ]),
      ),
    } as RPC_MAP,
    enableQaHelpers: toBoolean(get('enableQaHelpers')),
    walletconnectProjectId:
      toOptionalString(get('walletconnectProjectId')) ??
      dynamics.walletconnectProjectId,
    matomoHost: toOptionalString(get('matomoHost')) ?? dynamics.matomoHost,
    ethAPIBasePath:
      toOptionalString(get('ethAPIBasePath')) ?? dynamics.ethAPIBasePath,
    wqAPIBasePath:
      toOptionalString(get('wqAPIBasePath')) ?? dynamics.wqAPIBasePath,
    rewardsBackendBasePath:
      toOptionalString(get('rewardsBackendBasePath')) ??
      dynamics.rewardsBackendBasePath,
    devnetOverrides: toOptionalString(get('devnetOverrides')),
    addressApiValidationEnabled: toBoolean(get('addressApiValidationEnabled')),
    useValidationFile: toBoolean(get('useValidationFile')),
    useConfigManifestFile: toBoolean(get('useConfigManifestFile')),
    isProd: toBoolean(get('isProd')),
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

// Don't use dynamics directly in the project!
// Only through:
// code```
//    import { config } from 'config'; // or
//    import { config } from './get-config'; // in config "namespace"
// ```
// Fail closed on web production builds: a missing window.__env__ means the
// window-env inline script was not substituted into the HTML (served
// outside the nginx entrypoint / preview middleware, or tampered with).
// The silent alternative is booting on the build-time env-dynamics
// defaults, which are TESTNET values — worse than a hard failure. Dev and
// vitest (PROD=false) keep the fallback; IPFS builds inline the env
// statically at build time, so absence there is not a runtime condition.
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
    'Runtime env missing: the window.__env__ inline script was not injected into the page',
  );
}

const src =
  typeof window !== 'undefined' && window.__env__
    ? window.__env__
    : (dynamics as unknown as Record<string, unknown>);

export default normalize(src);
