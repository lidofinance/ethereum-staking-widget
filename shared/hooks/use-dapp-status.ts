import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { isSDKSupportedL2Chain, LIDO_MULTICHAIN_CHAINS } from 'consts/chains';

import { useIsSupportedChain } from './use-is-supported-chain';
import { useConfig } from 'config';

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

  const isDappActiveOnL1 = useMemo(() => {
    if (!chainId) return false;

    return isDappActive && !isSDKSupportedL2Chain(chainId);
  }, [chainId, isDappActive]);

  const isDappActiveOnL2 = useMemo(() => {
    if (!chainId) return false;

    return isDappActive && isSDKSupportedL2Chain(chainId);
  }, [chainId, isDappActive]);

  return {
    isWalletConnected,
    isSupportedChain,
    isLidoMultichainChain,
    isDappActive,
    isDappActiveOnL1,
    isDappActiveOnL2,
  };
};
