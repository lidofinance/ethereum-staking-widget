import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { LIDO_MULTICHAIN_CHAINS } from 'consts/chains';

import { useIsSupportedChain } from './use-is-supported-chain';
import { useConfig } from 'config';
import { CHAINS } from 'consts/chains';

export const useDappStatus = () => {
  const { multiChainBanner } = useConfig().externalConfig;
  const { chainId, isConnected: isWalletConnected } = useAccount();
  const isSupportedChain = useIsSupportedChain();

  const isLidoMultichainChain = useMemo(
    () =>
      !!chainId &&
      !!LIDO_MULTICHAIN_CHAINS[chainId] &&
      multiChainBanner.includes(chainId),
    [chainId, multiChainBanner],
  );

  const isDappActive = useMemo(() => {
    if (!chainId) return false;

    return isWalletConnected && isSupportedChain;
  }, [chainId, isWalletConnected, isSupportedChain]);

  const isDappActiveOnStakePage = useMemo(() => {
    return isDappActive && chainId !== CHAINS.OPSepoliaTestnet;
  }, [chainId, isDappActive]);

  return {
    isWalletConnected,
    isSupportedChain,
    isLidoMultichainChain,
    isDappActive,
    isDappActiveOnStakePage,
  };
};
