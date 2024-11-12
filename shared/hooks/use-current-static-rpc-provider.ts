import { useMemo } from 'react';
import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

import { useRpcUrl } from 'config/rpc';
import { config } from 'config';
import { useDappStatus } from 'modules/web3';

export const useCurrentStaticRpcProvider = (): {
  staticRpcProvider: StaticJsonRpcBatchProvider;
  chainId: CHAINS;
} => {
  const { chainId } = useDappStatus();
  const rpcUrl = useRpcUrl();

  const staticRpcProvider = useMemo(() => {
    return getStaticRpcBatchProvider(
      chainId,
      rpcUrl,
      config.PROVIDER_POLLING_INTERVAL,
    );
  }, [chainId, rpcUrl]);

  return {
    staticRpcProvider,
    chainId,
  };
};
