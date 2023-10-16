import { useSDK } from '@lido-sdk/react';
import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

import { useRpcUrl } from 'config';

export const useCurrentProvider = (): {
  provider: StaticJsonRpcBatchProvider;
  chainId: CHAINS;
} => {
  const { chainId } = useSDK();
  const rpcUrl = useRpcUrl();

  const provider = getStaticRpcBatchProvider(chainId, rpcUrl);

  return {
    provider,
    chainId,
  };
};
