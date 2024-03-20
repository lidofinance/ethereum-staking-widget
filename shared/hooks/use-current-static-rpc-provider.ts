import { useMemo } from 'react';
import { useSDK } from '@lido-sdk/react';
import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

import { useRpcUrl } from 'config/rpc';

export const useCurrentStaticRpcProvider = (): {
  staticRpcProvider: StaticJsonRpcBatchProvider;
  chainId: CHAINS;
} => {
  const { chainId } = useSDK();
  const rpcUrl = useRpcUrl();

  const staticRpcProvider = useMemo(() => {
    return getStaticRpcBatchProvider(chainId, rpcUrl);
  }, [chainId, rpcUrl]);

  return {
    staticRpcProvider,
    chainId,
  };
};
