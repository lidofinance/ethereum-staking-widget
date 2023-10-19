import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useSDK } from '@lido-sdk/react';

import { useCustomConfig } from 'providers/custom-config';
import { CHAINS } from 'utils/chains';

import dynamics from './dynamics';

export const getBackendRPCPath = (chainId: string | number): string => {
  const BASE_URL = typeof window === 'undefined' ? '' : window.location.origin;
  return `${BASE_URL}/api/rpc?chainId=${chainId}`;
};

// TODO: naming
export const useGetRpcUrlByChainId = () => {
  const customConfig = useCustomConfig();
  return useCallback(
    (chainId: CHAINS) => {
      if (dynamics.ipfsMode) {
        const rpc =
          customConfig.savedCustomConfig.rpcUrls[chainId] ||
          customConfig.settingsPrefillRpc ||
          ''; // fallback must be set

        invariant(rpc, '[useGetRpcUrlByChainId] RPC is required!');
        return rpc;
      } else {
        return getBackendRPCPath(chainId);
      }
    },
    [customConfig],
  );
};

export const useRpcUrl = () => {
  const { chainId } = useSDK();
  const getRpcUrlByChainId = useGetRpcUrlByChainId();
  // TODO: use `satisfies` when will be TS v5
  return getRpcUrlByChainId(chainId as unknown as CHAINS);
};
