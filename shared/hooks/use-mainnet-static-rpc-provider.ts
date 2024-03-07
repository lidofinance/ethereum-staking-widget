import { useMemo } from 'react';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

import { useGetRpcUrlByChainId } from 'config';
import { CHAINS } from 'utils';

export const useMainnetStaticRpcProvider = (): StaticJsonRpcBatchProvider => {
  const getRpcUrl = useGetRpcUrlByChainId();
  return useMemo(() => {
    return getStaticRpcBatchProvider(1, getRpcUrl(CHAINS.Mainnet));
  }, [getRpcUrl]);
};
