import { config } from 'config';

export const ETHPLORER_TOKEN_ENDPOINT =
  'https://api.ethplorer.io/getTokenInfo/';

// 5th August, Monday, middle of the working day
export const API_DEFAULT_SUNSET_TIMESTAMP = new Date(
  '2024-08-05T09:00:00',
).getTime();

// 9th September, Monday, middle of the working day
export const API_LATER_SUNSET_TIMESTAMP = new Date(
  '2024-09-09T09:00:00',
).getTime();

export const enum API_ROUTES {
  ETH_APR = 'api/eth-apr',
  ETH_PRICE = 'api/eth-price',
  LDO_STATS = 'api/ldo-stats',
  LIDO_STATS = 'api/lido-stats',
  LIDOSTATS = 'api/lidostats',
  ONEINCH_RATE = 'api/oneinch-rate',
  SHORT_LIDO_STATS = 'api/short-lido-stats',
  SMA_STETH_APR = 'api/sma-steth-apr',
  TOTALSUPPLY = 'api/totalsupply',
  RPC = 'api/rpc',
  METRICS = 'api/metrics',
  REWARDS = 'api/rewards',
}

export const enum ETH_API_ROUTES {
  ETH_APR = '/v1/protocol/eth/apr/last',
  ETH_PRICE = '/v1/protocol/eth/price',
  STETH_STATS = '/v1/protocol/steth/stats',
  STETH_SMA_APR = '/v1/protocol/steth/apr/sma',
  SWAP_ONE_INCH = '/v1/swap/one-inch',
  CURVE_APR = '/v1/pool/curve/steth-eth/apr/last',
}

export const getEthApiPath = (
  endpoint: ETH_API_ROUTES,
  params?:
    | string
    | string[][]
    | Record<string, string>
    | URLSearchParams
    | undefined,
) => {
  if (!config.ethAPIBasePath) {
    return undefined;
  }

  let search = new URLSearchParams(params).toString();
  search = search ? '?' + search : '';
  return config.ethAPIBasePath + endpoint + search;
};

export const getReplacementLink = (
  apiRoute: API_ROUTES,
): string | undefined => {
  switch (apiRoute) {
    case API_ROUTES.ETH_APR:
      return getEthApiPath(ETH_API_ROUTES.ETH_APR);
    case API_ROUTES.ETH_PRICE:
      return getEthApiPath(ETH_API_ROUTES.ETH_PRICE);
    case API_ROUTES.TOTALSUPPLY:
    case API_ROUTES.SHORT_LIDO_STATS:
      return getEthApiPath(ETH_API_ROUTES.STETH_STATS);
    case API_ROUTES.SMA_STETH_APR:
      return getEthApiPath(ETH_API_ROUTES.STETH_SMA_APR);
    case API_ROUTES.ONEINCH_RATE:
      return getEthApiPath(ETH_API_ROUTES.SWAP_ONE_INCH);
    default:
      throw new Error(`No replacement link found for route: ${apiRoute}`);
  }
};
