// This module is imported both inside the Vite process
// (scripts/vite/window-env-plugin.ts builds the inline window.__env__
// script from it in dev/IPFS) and by the browser bundle (config/dynamics.ts
// falls back to it where no window exists, e.g. vitest's node env). In the
// browser `process` does not exist — guard it so module init never throws.
const env = typeof process !== 'undefined' && process.env ? process.env : {};

/**
 * Convert to bool:
 * - true to true
 * - 'true' to true
 * - 1 to true
 * - '1' to true
 * - another values to false
 * @returns {Boolean}
 */
const toBoolean = (val) => {
  return !!(
    val?.toLowerCase?.() === 'true' ||
    val === true ||
    Number.parseInt(val, 10) === 1
  );
};

/** @type boolean */
export const isProd = toBoolean(env.IS_PROD);

/** @type boolean */
export const ipfsMode = toBoolean(env.IPFS_MODE);

/** @type string */
export const selfOrigin = env.SELF_ORIGIN || 'https://stake.lido.fi';
// Fix in the build time (build time don't have env vars)

/** @type string */
export const rootOrigin = env.ROOT_ORIGIN || 'https://lido.fi';
// Fix in the build time (build time don't have env vars)

/** @type string */
export const docsOrigin = env.DOCS_ORIGIN || 'https://docs.lido.fi';
// Fix in the build time (build time don't have env vars)

/** @type string */
export const helpOrigin = env.HELP_ORIGIN || 'https://help.lido.fi';
// Fix in the build time (build time don't have env vars)

/** @type string */
export const researchOrigin = env.RESEARCH_ORIGIN || 'https://research.lido.fi';
// Fix in the build time (build time don't have env vars)

/** @type string */
export const blogOrigin = env.BLOG_ORIGIN || 'https://blog.lido.fi';
// Fix in the build time (build time don't have env vars)

// Keep fallback as in 'config/get-secret-config.ts'
/** @type number */
export const defaultChain = parseInt(env.DEFAULT_CHAIN, 10) || 560048;
/** @type number[] */
export const supportedChains = env?.SUPPORTED_CHAINS?.split(',').map(
  (chainId) => parseInt(chainId, 10),
) ?? [560048];
// Keep fallback as in 'config/get-secret-config.ts'
/** @type string | undefined */
export const manifestOverride = env.MANIFEST_OVERRIDE;

/** @type {Record<number, string[]>} */
export const prefillUnsafeElRpcUrls = [1, ...supportedChains].reduce(
  (acc, chainId) => {
    const envVarName = `PREFILL_UNSAFE_EL_RPC_URLS_${chainId}`;
    const envVarValue = env[envVarName];
    acc[chainId] = envVarValue?.split(',') ?? [];
    return acc;
  },
  {},
);

/** @type boolean */
export const enableQaHelpers = toBoolean(env.ENABLE_QA_HELPERS);

// QA_GEO_COUNTRY (the Cloudflare-country stand-in, see .env.example) is NOT
// exported here: on develop it flowed through the Next runtime config to the
// /api/geo handler, but in this build the fastify server reads it from env
// directly (server/src/config.ts) and the SPA never uses it.

/** @type string */
export const walletconnectProjectId = env.WALLETCONNECT_PROJECT_ID;

/** @type string */
export const matomoHost = env.MATOMO_URL;

/** @type string */
export const ethAPIBasePath = env.ETH_API_BASE_PATH;

/** @type string */
export const wqAPIBasePath = env.WQ_API_BASE_PATH;
/** @type string */

/** @type string */
export const rewardsBackendBasePath = env.REWARDS_BACKEND_BASE_PATH;

/** @type string | undefined */
export const devnetOverrides = env.DEVNET_OVERRIDES;

/** @type boolean */
export const addressApiValidationEnabled = !!env.VALIDATION_SERVICE_BASE_PATH;

/** @type boolean */
// presence flag only — the path itself is the api pod's filesystem detail
// and must not ship to the browser
export const useValidationFile = Boolean(env.VALIDATION_FILE_PATH);

/** @type boolean */
// CONFIG_MANIFEST_PATH is a file path, so presence check, not toBoolean
export const useConfigManifestFile = Boolean(env.CONFIG_MANIFEST_PATH);
