export const ETHPLORER_TOKEN_ENDPOINT =
  'https://api.ethplorer.io/getTokenInfo/';

export const HEALTHY_RPC_SERVICES_ARE_OVER = 'Healthy RPC services are over!';

// 3rd June, Monday, middle of the working day
export const API_DEFAULT_SUNSET_TIMESTAMP = new Date(
  '2024-06-03T09:00:00',
).getTime();

export const MAINNET_REPLACEMENT_LINKS: Partial<Record<API_ROUTES, string>> = {
  'api/eth-apr': 'https://eth-api.lido.fi/v1/protocol/eth/apr/last',
};

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
