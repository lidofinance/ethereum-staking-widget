import { config } from 'config';

export const ETHPLORER_TOKEN_ENDPOINT =
  'https://api.ethplorer.io/getTokenInfo/';

export const enum API_ROUTES {
  RPC = 'api/rpc',
  METRICS = 'api/metrics',
  REWARDS = 'api/rewards',
  VALIDATION = 'api/validation',
  EARN_VAULTS_APR = 'api/earn/vaults-apr',
  EARN_VAULTS_TVL = 'api/earn/vaults-tvl',
}

export const enum ETH_API_ROUTES {
  ETH_APR = '/v1/protocol/eth/apr/last',
  ETH_PRICE = '/v1/protocol/eth/price',
  STETH_STATS = '/v1/protocol/steth/stats',
  STETH_SMA_APR = '/v1/protocol/steth/apr/sma',
  SWAP_ONE_INCH = '/v1/swap/one-inch',
  SWAP_JUMPER = '/v1/swap/jumper',
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
): string | undefined => {
  if (!config.ethAPIBasePath) {
    return undefined;
  }

  let search = new URLSearchParams(params).toString();
  search = search ? '?' + search : '';
  return config.ethAPIBasePath + endpoint + search;
};
