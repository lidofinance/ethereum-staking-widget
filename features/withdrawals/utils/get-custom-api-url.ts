import type { LidoSDKWithdraw } from '@lidofinance/lido-ethereum-sdk/withdraw';

// TODO: fix import in lido-ethereum-sdk
// import { WqApiCustomUrlGetter } from '@lidofinance/lido-ethereum-sdk/withdraw';
export type WqApiCustomUrlGetter = Parameters<
  LidoSDKWithdraw['waitingTime']['getWithdrawalWaitingTimeByAmount']
>[0]['getCustomApiUrl'];

import { config } from 'config';
import invariant from 'tiny-invariant';

// used by SDK to get custom API URL
export const getWQApiUrlByChain: WqApiCustomUrlGetter = (
  defaultUrl,
  chainId,
) => {
  // if chainId used by SDK is our default chain, use URL from app config
  // otherwise trust SDK to use correct URL
  const url =
    chainId === config.defaultChain ? config.wqAPIBasePath : defaultUrl;
  invariant(url, 'Missing URL for WQ API');

  return url;
};
