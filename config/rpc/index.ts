import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { CHAINS } from 'consts/chains';

// Don't use absolute import here!
// code'''
//    import { config } from 'config';
// '''
// otherwise you will get something like a cyclic error!
import { config } from '../get-config';

import { useUserConfig } from '../user-config';

export const getBackendRPCPath = (chainId: string | number): string => {
  const BASE_URL = typeof window === 'undefined' ? '' : window.location.origin;
  return `${BASE_URL}/api/rpc?chainId=${chainId}`;
};

export const useGetRpcUrlByChainId = () => {
  const userConfig = useUserConfig();

  return useCallback(
    (chainId: CHAINS) => {
      if (config.ipfsMode) {
        const rpc =
          userConfig.savedUserConfig.rpcUrls[chainId] ||
          userConfig.prefillUnsafeElRpcUrls[chainId]?.[0];

        invariant(rpc, '[useGetRpcUrlByChainId] RPC is required!');
        return rpc;
      }

      return (
        userConfig.savedUserConfig.rpcUrls[chainId] ||
        getBackendRPCPath(chainId)
      );
    },
    [userConfig],
  );
};
