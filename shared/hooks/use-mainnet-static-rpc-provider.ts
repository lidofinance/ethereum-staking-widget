import { useMemo } from 'react';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

import { useRpcUrl } from 'config/rpc';

export const useMainnetStaticRpcProvider = (): StaticJsonRpcBatchProvider => {
  const rpcUrl = useRpcUrl();

  return useMemo(() => {
    return getStaticRpcBatchProvider(1, rpcUrl);
  }, [rpcUrl]);
};
