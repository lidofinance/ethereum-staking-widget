import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import {
  LIDO_MULTICHAIN_CHAINS,
  SDK_SUPPORTED_MULTICHAIN_CHAINS,
} from 'consts/chains';

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

  // TODO: rename isDappActive to isDappActiveOnL1
  const isDappActive = useMemo(() => {
    if (!chainId) return false;

    return isWalletConnected && isSupportedChain;
  }, [chainId, isWalletConnected, isSupportedChain]);

  const isDappActiveOnL2 = useMemo(() => {
    if (!chainId) return false;

    return SDK_SUPPORTED_MULTICHAIN_CHAINS.indexOf(chainId) > -1;
  }, [chainId]);

  return {
    isWalletConnected,
    isSupportedChain,
    isLidoMultichainChain,
    isDappActive,
    isDappActiveOnL2,
  };
};
