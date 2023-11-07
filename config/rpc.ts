import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useSDK } from '@lido-sdk/react';

import { useClientConfig } from 'providers/client-config';
import { CHAINS } from 'utils/chains';

import dynamics from './dynamics';

export const getBackendRPCPath = (chainId: string | number): string => {
  const BASE_URL = typeof window === 'undefined' ? '' : window.location.origin;
  return `${BASE_URL}/api/rpc?chainId=${chainId}`;
};

export const useGetRpcUrlByChainId = () => {
  const clientConfig = useClientConfig();

  return useCallback(
    (chainId: CHAINS) => {
      if (dynamics.ipfsMode) {
        const rpc =
          clientConfig.savedClientConfig.rpcUrls[chainId] ||
          clientConfig.prefillUnsafeElRpcUrls?.[0];

        invariant(rpc, '[useGetRpcUrlByChainId] RPC is required!');
        return rpc;
      } else {
        return (
          clientConfig.savedClientConfig.rpcUrls[chainId] ||
          getBackendRPCPath(chainId)
        );
      }
    },
    [clientConfig],
  );
};

export const useRpcUrl = () => {
  const { chainId } = useSDK();
  const getRpcUrlByChainId = useGetRpcUrlByChainId();
  return getRpcUrlByChainId(chainId as number);
};
