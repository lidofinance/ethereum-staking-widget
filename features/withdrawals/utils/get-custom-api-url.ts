// TODO
// import { WqApiCustomUrlGetter } from '@lidofinance/lido-ethereum-sdk/withdraw';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';
export type WqApiCustomUrlGetter = (
  defaultUrl: string | null,
  chainId: CHAINS,
) => string;

import { config } from 'config';

export const getCustomApiUrl: WqApiCustomUrlGetter = (defaultUrl, chainId) => {
  if (chainId === config.defaultChain) {
    return config.wqAPIBasePath ?? '';
  }

  return defaultUrl ?? '';
};
