/*
 * We need to limit how many statuses reported to prometheus, because of cardinality
 *
 * Examples:
 * getStatusLabel(200) => '2xx'
 * getStatusLabel(404) => '4xx'
 * getStatusLabel(undefined) => 'xxx'
 */
export const getStatusLabel = (status: number | undefined) => {
  if (status == null || status < 100 || status > 600) {
    return 'xxx';
  }
  const majorStatus = Math.trunc(status / 100);
  return `${majorStatus}xx`;
};

/*
 * We also need to limit cardinality of provider labels reported to prometheus, but here
 * we don't need to check if provider is included in the list of available providers,
 * because we get provider from this list itself, but not from user.
 *
 * Examples:
 * getProviderLabel('https://eth-mainnet.alchemyapi.io/v2/...') => 'alchemyapi.io'
 * getProviderLabel('https://goerli.infura.io/v3/...') => 'infura.io'
 */
export const getProviderLabel = (providerURL: string) => {
  const parsedUrl = new URL(providerURL);
  return parsedUrl.hostname.split('.').slice(-2).join('.');
};
