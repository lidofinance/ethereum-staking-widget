/**
 * Convert to bool:
 * - true to true
 * - 'true' to true
 * - 1 to true
 * - '1' to true
 * - another values to false
 * @returns {Boolean}
 */
const toBoolean = (dataStr) => {
  return !!(
    dataStr?.toLowerCase?.() === 'true' ||
    dataStr === true ||
    Number.parseInt(dataStr, 10) === 1
  );
};

/** @type string */
export const matomoHost = process.env.MATOMO_URL;
/** @type number */
export const defaultChain = parseInt(process.env.DEFAULT_CHAIN, 10) || 1;
/** @type number[] */

export const supportedChains = process.env?.SUPPORTED_CHAINS?.split(',').map(
  (chainId) => parseInt(chainId, 10),
) ?? [1, 4, 5];
/** @type boolean */
export const enableQaHelpers = toBoolean(process.env.ENABLE_QA_HELPERS);
/** @type string */
export const ethAPIBasePath = process.env.ETH_API_BASE_PATH;
/** @type string */
export const wqAPIBasePath = process.env.WQ_API_BASE_PATH;
/** @type string */
export const walletconnectProjectId = process.env.WALLETCONNECT_PROJECT_ID;
