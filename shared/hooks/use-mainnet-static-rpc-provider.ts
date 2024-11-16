import { useMemo } from 'react';
import { CHAINS as SDK_CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

import { useGetRpcUrlByChainId } from 'config/rpc';
import { CHAINS } from 'consts/chains';
import { config } from 'config';

// TODO: NEW SDK (to remove when SDK legace will be removed)
export const useMainnetStaticRpcProvider = (): StaticJsonRpcBatchProvider => {
  const getRpcUrl = useGetRpcUrlByChainId();
  return useMemo(() => {
    return getStaticRpcBatchProvider(
      CHAINS.Mainnet as unknown as SDK_CHAINS,
      getRpcUrl(CHAINS.Mainnet),
      config.PROVIDER_POLLING_INTERVAL,
    );
  }, [getRpcUrl]);
};
