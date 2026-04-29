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
export const basePath = process.env.BASE_PATH || '';

/** @type boolean */
export const developmentMode = process.env.NODE_ENV === 'development';

/** @type boolean */
export const collectMetrics = process.env.COLLECT_METRICS === 'true';

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
export const researchOrigin =
  process.env.RESEARCH_ORIGIN || 'https://research.lido.fi';
// Fix in the build time (build time don't have env vars)

/** @type string */
export const blogOrigin = process.env.BLOG_ORIGIN || 'https://blog.lido.fi';
// Fix in the build time (build time don't have env vars)

// Keep fallback as in 'config/get-secret-config.ts'
/** @type number */
export const defaultChain = parseInt(process.env.DEFAULT_CHAIN, 10) || 560048;
/** @type number[] */
export const supportedChains = process.env?.SUPPORTED_CHAINS?.split(',').map(
  (chainId) => parseInt(chainId, 10),
) ?? [560048];
// Keep fallback as in 'config/get-secret-config.ts'
/** @type string | undefined */
export const manifestOverride = process.env.MANIFEST_OVERRIDE;

/** @type string[] */
export const prefillUnsafeElRpcUrls1 =
  process.env.PREFILL_UNSAFE_EL_RPC_URLS_1?.split(',') ?? [];
/** @type string[] */
export const prefillUnsafeElRpcUrls17000 =
  process.env.PREFILL_UNSAFE_EL_RPC_URLS_17000?.split(',') ?? [];
/** @type string[] */
export const prefillUnsafeElRpcUrls560048 =
  process.env.PREFILL_UNSAFE_EL_RPC_URLS_560048?.split(',') ?? [];
/** @type string[] */
export const prefillUnsafeElRpcUrls11155111 =
  process.env.PREFILL_UNSAFE_EL_RPC_URLS_11155111?.split(',') ?? [];
/** @type string[] */
export const prefillUnsafeElRpcUrls10 =
  process.env.PREFILL_UNSAFE_EL_RPC_URLS_10?.split(',') ?? [];
/** @type string[] */
export const prefillUnsafeElRpcUrls11155420 =
  process.env.PREFILL_UNSAFE_EL_RPC_URLS_11155420?.split(',') ?? [];
/** @type string[] */
export const prefillUnsafeElRpcUrls1868 =
  process.env.PREFILL_UNSAFE_EL_RPC_URLS_1868?.split(',') ?? [];
/** @type string[] */
export const prefillUnsafeElRpcUrls1946 =
  process.env.PREFILL_UNSAFE_EL_RPC_URLS_1946?.split(',') ?? [];
/** @type string[] */
export const prefillUnsafeElRpcUrls130 =
  process.env.PREFILL_UNSAFE_EL_RPC_URLS_130?.split(',') ?? [];
/** @type string[] */
export const prefillUnsafeElRpcUrls1301 =
  process.env.PREFILL_UNSAFE_EL_RPC_URLS_1301?.split(',') ?? [];

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
export const rewardsBackendBasePath = process.env.REWARDS_BACKEND_BASE_PATH;

/** @type string */
export const devnetOverrides = process.env.DEVNET_OVERRIDES;

/** @type boolean */
export const addressApiValidationEnabled =
  !!process.env.VALIDATION_SERVICE_BASE_PATH;

/** @type string */
export const validationFilePath = process.env.VALIDATION_FILE_PATH;

// Config buckets for Next.js
export const clientConfig = {
  basePath,
  developmentMode,
  collectMetrics,
  BASE_PATH: basePath,
  IPFS_MODE: process.env.IPFS_MODE || '',
  SELF_ORIGIN: selfOrigin,
  ROOT_ORIGIN: rootOrigin,
  DOCS_ORIGIN: docsOrigin,
  HELP_ORIGIN: helpOrigin,
  RESEARCH_ORIGIN: researchOrigin,
  BLOG_ORIGIN: blogOrigin,
  DEFAULT_CHAIN: String(defaultChain),
  SUPPORTED_CHAINS: process.env.SUPPORTED_CHAINS || '',
  MANIFEST_OVERRIDE: manifestOverride || '',
  PREFILL_UNSAFE_EL_RPC_URLS_1: process.env.PREFILL_UNSAFE_EL_RPC_URLS_1 || '',
  PREFILL_UNSAFE_EL_RPC_URLS_17000:
    process.env.PREFILL_UNSAFE_EL_RPC_URLS_17000 || '',
  PREFILL_UNSAFE_EL_RPC_URLS_560048:
    process.env.PREFILL_UNSAFE_EL_RPC_URLS_560048 || '',
  PREFILL_UNSAFE_EL_RPC_URLS_11155111:
    process.env.PREFILL_UNSAFE_EL_RPC_URLS_11155111 || '',
  PREFILL_UNSAFE_EL_RPC_URLS_10: process.env.PREFILL_UNSAFE_EL_RPC_URLS_10 || '',
  PREFILL_UNSAFE_EL_RPC_URLS_11155420:
    process.env.PREFILL_UNSAFE_EL_RPC_URLS_11155420 || '',
  PREFILL_UNSAFE_EL_RPC_URLS_1868:
    process.env.PREFILL_UNSAFE_EL_RPC_URLS_1868 || '',
  PREFILL_UNSAFE_EL_RPC_URLS_1946:
    process.env.PREFILL_UNSAFE_EL_RPC_URLS_1946 || '',
  PREFILL_UNSAFE_EL_RPC_URLS_130:
    process.env.PREFILL_UNSAFE_EL_RPC_URLS_130 || '',
  PREFILL_UNSAFE_EL_RPC_URLS_1301:
    process.env.PREFILL_UNSAFE_EL_RPC_URLS_1301 || '',
  ENABLE_QA_HELPERS: String(enableQaHelpers),
  WALLETCONNECT_PROJECT_ID: walletconnectProjectId || '',
  MATOMO_URL: matomoHost || '',
  ETH_API_BASE_PATH: ethAPIBasePath || '',
  WQ_API_BASE_PATH: wqAPIBasePath || '',
  REWARDS_BACKEND_BASE_PATH: rewardsBackendBasePath || '',
  DEVNET_OVERRIDES: devnetOverrides || '',
  VALIDATION_SERVICE_BASE_PATH:
    process.env.VALIDATION_SERVICE_BASE_PATH || '',
  COLLECT_METRICS: collectMetrics ? 'true' : 'false',
  addressApiValidationEnabled,
  defaultChain,
  ipfsMode,
  selfOrigin,

  ethAPIBasePath,
  supportedChains,
  researchOrigin,
  rootOrigin,
  docsOrigin,
  rewardsBackendBasePath,
  prefillUnsafeElRpcUrls1,
  prefillUnsafeElRpcUrls17000,
  prefillUnsafeElRpcUrls560048,
  prefillUnsafeElRpcUrls11155111,
  prefillUnsafeElRpcUrls10,
  prefillUnsafeElRpcUrls11155420,
  prefillUnsafeElRpcUrls1868,
  prefillUnsafeElRpcUrls1946,
  prefillUnsafeElRpcUrls130,
  prefillUnsafeElRpcUrls1301,

  walletconnectProjectId,
  validationFilePath,
};

export const serverConfig = {
  basePath,
  developmentMode,
  devnetOverrides,
  rpcUrls_1: process.env.EL_RPC_URLS_1,
  rpcUrls_17000: process.env.EL_RPC_URLS_17000,
  rpcUrls_560048: process.env.EL_RPC_URLS_560048,
  rpcUrls_11155111: process.env.EL_RPC_URLS_11155111,
  rpcUrls_10: process.env.EL_RPC_URLS_10,
  rpcUrls_11155420: process.env.EL_RPC_URLS_11155420,
  rpcUrls_1868: process.env.EL_RPC_URLS_1868,
  rpcUrls_1946: process.env.EL_RPC_URLS_1946,
  rpcUrls_130: process.env.EL_RPC_URLS_130,
  rpcUrls_1301: process.env.EL_RPC_URLS_1301,
  cspTrustedHosts: process.env.CSP_TRUSTED_HOSTS,
  cspReportOnly: process.env.CSP_REPORT_ONLY,
  cspReportUri: process.env.CSP_REPORT_URI,
  rateLimit: process.env.RATE_LIMIT,
  rateLimitTimeFrame: process.env.RATE_LIMIT_TIME_FRAME,
  ethAPIBasePath,
  rewardsBackendAPI: process.env.REWARDS_BACKEND,
  validationAPI: process.env.VALIDATION_SERVICE_BASE_PATH,


};
