import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useSDK } from '@lido-sdk/react';

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
      // This condition is needed because in 'providers/web3.tsx' we add `wagmiChains.polygonMumbai` to supportedChains as a workaround.
      // polygonMumbai (80001) may cause an invariant throwing.
      // And we always need Mainnet RPC for some requests, e.g. ETH to USD price, ENS lookup.
      if (
        chainId !== CHAINS.Mainnet &&
        !userConfig.supportedChainIds.includes(chainId)
      ) {
        // Has no effect on functionality. Just a fix.
        // Return empty string as a stub
        // (see: 'providers/web3.tsx' --> jsonRpcBatchProvider --> getStaticRpcBatchProvider)
        return '';
      }

      if (config.ipfsMode) {
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
