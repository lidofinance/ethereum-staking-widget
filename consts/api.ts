import { config } from 'config';

export const ETHPLORER_TOKEN_ENDPOINT =
  'https://api.ethplorer.io/getTokenInfo/';

export const HEALTHY_RPC_SERVICES_ARE_OVER = 'Healthy RPC services are over!';

// 5rd August, Monday, middle of the working day
export const API_DEFAULT_SUNSET_TIMESTAMP = new Date(
  '2024-08-05T09:00:00',
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

const getEthApiOrigin = (path: string) => {
  return config.ethAPIBasePath + path;
};

export const getReplacementLink = (apiRoute: API_ROUTES): string => {
  switch (apiRoute) {
    case API_ROUTES.ETH_APR:
      return getEthApiOrigin('/v1/protocol/eth/apr/last');
    case API_ROUTES.ETH_PRICE:
      return getEthApiOrigin('/v1/protocol/eth/price');
    case API_ROUTES.TOTALSUPPLY:
    case API_ROUTES.SHORT_LIDO_STATS:
      return getEthApiOrigin('/v1/protocol/steth/stats');
    case API_ROUTES.SMA_STETH_APR:
      return getEthApiOrigin('/v1/protocol/steth/apr/sma');
    case API_ROUTES.ONEINCH_RATE:
      return getEthApiOrigin('/v1/swap/one-inch');
    default:
      throw new Error(`No replacement link found for route: ${apiRoute}`);
  }
};
