import { useMemo } from 'react';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

import { useGetRpcUrlByChainId } from 'config/rpc';
import { CHAINS } from 'consts/chains';

export const useMainnetStaticRpcProvider = (): StaticJsonRpcBatchProvider => {
  const getRpcUrl = useGetRpcUrlByChainId();
  return useMemo(() => {
    return getStaticRpcBatchProvider(1, getRpcUrl(CHAINS.Mainnet));
  }, [getRpcUrl]);
};
