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
export const ipfsMode = toBoolean(process.env.IPFS_MODE);

/** @type string */
export const selfOrigin = process.env.SELF_ORIGIN || 'https://stake.lido.fi';
// Fix in the build time (build time don't have env vars)

/** @type string */
export const rootOrigin = process.env.ROOT_ORIGIN || 'https://lido.fi';
// Fix in the build time (build time don't have env vars)

/** @type string */
export const docsOrigin = process.env.DOCS_ORIGIN || 'https://docs.lido.fi';
// Fix in the build time (build time don't have env vars)

/** @type string */
export const helpOrigin = process.env.HELP_ORIGIN || 'https://help.lido.fi';
// Fix in the build time (build time don't have env vars)

/** @type string */
export const researchOrigin = process.env.RESEARCH_ORIGIN || 'https://research.lido.fi';
// Fix in the build time (build time don't have env vars)

// Keep fallback as in 'config/get-secret-config.ts'
/** @type number */
export const defaultChain = parseInt(process.env.DEFAULT_CHAIN, 10) || 17000;
/** @type number[] */
export const supportedChains = process.env?.SUPPORTED_CHAINS?.split(',').map(
  (chainId) => parseInt(chainId, 10),
) ?? [17000];

/** @type string[] */
export const prefillUnsafeElRpcUrls1 = process.env.PREFILL_UNSAFE_EL_RPC_URLS_1?.split(',') ?? [];
/** @type string[] */
export const prefillUnsafeElRpcUrls17000 = process.env.PREFILL_UNSAFE_EL_RPC_URLS_17000?.split(',') ?? [];

/** @type boolean */
export const enableQaHelpers = toBoolean(process.env.ENABLE_QA_HELPERS);

export const walletconnectProjectId = process.env.WALLETCONNECT_PROJECT_ID;

/** @type string */
export const matomoHost = process.env.MATOMO_URL;

/** @type string */
export const ethAPIBasePath = process.env.ETH_API_BASE_PATH;

/** @type string */
export const wqAPIBasePath = process.env.WQ_API_BASE_PATH;
/** @type string */

/** @type string */
export const widgetApiBasePathForIpfs =
  process.env.WIDGET_API_BASE_PATH_FOR_IPFS;

/** @type string */
export const rewardsBackendBasePath =
  process.env.REWARDS_BACKEND_BASE_PATH;

