import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useSDK } from '@lido-sdk/react';

import { CHAINS } from 'consts/chains';

// Not use absolute import here!
// code'''
//    import { getConfig } from 'config';
// '''
import { getConfig } from '../get-config';
const { ipfsMode } = getConfig();

import { useUserConfig } from '../user-config';

export const getBackendRPCPath = (chainId: string | number): string => {
  const BASE_URL = typeof window === 'undefined' ? '' : window.location.origin;
  return `${BASE_URL}/api/rpc?chainId=${chainId}`;
};

export const useGetRpcUrlByChainId = () => {
  const userConfig = useUserConfig();

  return useCallback(
    (chainId: CHAINS) => {
      // Needs this condition 'cause in 'providers/web3.tsx' we add `wagmiChains.polygonMumbai` to supportedChains
      // so, here chainId = 80001 is arriving which to raises an invariant
      // chainId = 1 we need anytime!
      if (
        chainId !== CHAINS.Mainnet &&
        !userConfig.supportedChainIds.includes(chainId)
      ) {
        // Has no effect on functionality. Just a fix.
        // Return empty string as stub
        // (see: 'providers/web3.tsx' --> jsonRpcBatchProvider --> getStaticRpcBatchProvider)
        return '';
      }

      if (ipfsMode) {
        const rpc =
          userConfig.savedUserConfig.rpcUrls[chainId] ||
          userConfig.prefillUnsafeElRpcUrls[chainId]?.[0];

        invariant(rpc, '[useGetRpcUrlByChainId] RPC is required!');
        return rpc;
      } else {
        return (
          userConfig.savedUserConfig.rpcUrls[chainId] ||
          getBackendRPCPath(chainId)
        );
      }
    },
    [userConfig],
  );
};

export const useRpcUrl = () => {
  const { chainId } = useSDK();
  return useGetRpcUrlByChainId()(chainId as number);
};
