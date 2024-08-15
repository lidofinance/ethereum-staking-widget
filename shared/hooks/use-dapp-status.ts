import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { LIDO_MULTICHAIN_CHAINS } from 'consts/chains';

import { useIsSupportedChain } from './use-is-supported-chain';

export const useDappStatus = () => {
  const { chainId, isConnected: isWalletConnected } = useAccount();
  const isSupportedChain = useIsSupportedChain();

  const isLidoMultichainChain = useMemo(
    () => !!chainId && !!LIDO_MULTICHAIN_CHAINS[chainId],
    [chainId],
  );

  const isDappActive = useMemo(() => {
    if (!chainId) return false;

    return isWalletConnected && isSupportedChain;
  }, [chainId, isWalletConnected, isSupportedChain]);

  return {
    isWalletConnected,
    isSupportedChain,
    isLidoMultichainChain,
    isDappActive,
  };
};
