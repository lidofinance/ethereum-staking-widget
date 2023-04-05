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
// TODO: remove this fallback
export const defaultChain =
  parseInt(`${process.env.DEFAULT_CHAIN},1337803`, 10) || 1;
/** @type number[] */
// TODO: remove this fallback
export const supportedChains = `${process.env?.SUPPORTED_CHAINS},1337803`
  ?.split(',')
  .map((chainId) => parseInt(chainId, 10)) ?? [1, 4, 5, 1337803];
/** @type boolean */
export const enableQaHelpers = toBoolean(process.env.ENABLE_QA_HELPERS);
/** @type string */
export const ethAPIBasePath = process.env.ETH_API_BASE_PATH;
