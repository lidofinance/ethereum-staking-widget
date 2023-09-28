import { useCallback } from 'react';
import { useSDK } from '@lido-sdk/react';

import { useCustomConfig } from 'providers/custom-config';
import { CHAINS } from 'utils/chains';

export const getBackendRPCPath = (chainId: string | number): string => {
  const BASE_URL = typeof window === 'undefined' ? '' : window.location.origin;
  return `${BASE_URL}/api/rpc?chainId=${chainId}`;
};

export const useGetRpcUrl = () => {
  const customConfig = useCustomConfig();
  return useCallback(
    (chainId: CHAINS) => {
      return (
        customConfig.savedCustomConfig.rpcUrls[chainId] ||
        customConfig.settingsPrefillRpc ||
        getBackendRPCPath(chainId)
      );
    },
    [customConfig],
  );
};

export const useRpcUrl = () => {
  const { chainId } = useSDK();
  const getRpcUrl = useGetRpcUrl();
  // TODO: use `satisfies` when will be TS v5
  return getRpcUrl(chainId as unknown as CHAINS);
};
