import { useSDK } from '@lido-sdk/react';
import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

import { useRpcUrl } from 'config';

export const useCurrentStaticRpcProvider = (): {
  staticRpcProvider: StaticJsonRpcBatchProvider;
  chainId: CHAINS;
} => {
  const { chainId } = useSDK();
  const rpcUrl = useRpcUrl();

  return {
    staticRpcProvider: getStaticRpcBatchProvider(chainId, rpcUrl),
    chainId,
  };
};
