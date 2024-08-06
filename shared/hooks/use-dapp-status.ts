import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { L2_CHAINS } from 'consts/chains';

import { useIsSupportedChain } from './use-is-supported-chain';

export const useDappStatus = () => {
  const { chainId, isConnected: isWalletConnected } = useAccount();
  const isSupportedChain = useIsSupportedChain();

  const isL2Chain = useMemo(() => !!chainId && !!L2_CHAINS[chainId], [chainId]);

  const isDappActive = useMemo(() => {
    if (!chainId) return false;

    return isWalletConnected && isSupportedChain;
  }, [chainId, isWalletConnected, isSupportedChain]);

  return {
    isWalletConnected,
    isSupportedChain,
    isL2Chain,
    isDappActive,
  };
};
