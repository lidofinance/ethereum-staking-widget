import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { L2_CHAINS } from 'consts/chains';

import { useIsSupportedChain } from './use-is-supported-chain';

export const useDappStatuses = () => {
  const { chainId, isConnected } = useAccount();
  const isSupportedChain = useIsSupportedChain();

  const isChainL2 = useMemo(() => {
    return (
      Object.values(L2_CHAINS).indexOf(chainId as unknown as L2_CHAINS) > -1
    );
  }, [chainId]);

  const isDappActive = useMemo(() => {
    if (!chainId) return false;

    return isConnected && isSupportedChain;
  }, [chainId, isConnected, isSupportedChain]);

  return {
    isConnected,
    isSupportedChain,
    isChainL2,
    isDappActive,
  };
};
