import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { isSDKSupportedL2Chain, LIDO_MULTICHAIN_CHAINS } from 'consts/chains';

import { useIsSupportedChain } from './use-is-supported-chain';
import { useConfig } from 'config';
import { useDappChain } from 'providers/dapp-chain';

export const useDappStatus = () => {
  const { multiChainBanner } = useConfig().externalConfig;
  const { chainId, isConnected: isWalletConnected } = useAccount();
  const isSupportedChain = useIsSupportedChain();
  const { isMatchDappChainAndWalletChain } = useDappChain();

  const isLidoMultichainChain = useMemo(
    () =>
      !!chainId &&
      !!LIDO_MULTICHAIN_CHAINS[chainId] &&
      multiChainBanner.includes(chainId),
    [chainId, multiChainBanner],
  );

  // TODO: rename to isAccountActive
  const isDappActive = useMemo(() => {
    if (!chainId) return false;

    return isWalletConnected && isSupportedChain;
  }, [chainId, isWalletConnected, isSupportedChain]);

  const isAccountActiveOnL1 = useMemo(() => {
    if (!chainId) return false;

    return isDappActive && !isSDKSupportedL2Chain(chainId);
  }, [chainId, isDappActive]);

  const isAccountActiveOnL2 = useMemo(() => {
    if (!chainId) return false;

    return isDappActive && isSDKSupportedL2Chain(chainId);
  }, [chainId, isDappActive]);

  const isDappActiveOnL1 = useMemo(() => {
    if (!chainId) return false;

    return isAccountActiveOnL1 && isMatchDappChainAndWalletChain(chainId);
  }, [chainId, isAccountActiveOnL1, isMatchDappChainAndWalletChain]);

  const isDappActiveOnL2 = useMemo(() => {
    if (!chainId) return false;

    return isAccountActiveOnL2 && isMatchDappChainAndWalletChain(chainId);
  }, [chainId, isAccountActiveOnL2, isMatchDappChainAndWalletChain]);

  // TODO: rename to isDappActive (see above)
  const isDappActiveAndNetworksMatched = useMemo(() => {
    if (!chainId) return false;

    return (
      (isAccountActiveOnL1 && isDappActiveOnL1) ||
      (isAccountActiveOnL2 && isDappActiveOnL2)
    );
  }, [
    chainId,
    isAccountActiveOnL1,
    isDappActiveOnL1,
    isAccountActiveOnL2,
    isDappActiveOnL2,
  ]);

  return {
    isWalletConnected,
    isSupportedChain,
    isLidoMultichainChain,

    // TODO: rename to isAccountActive
    isDappActive,

    isAccountActiveOnL1,
    isAccountActiveOnL2,

    isDappActiveOnL1,
    isDappActiveOnL2,

    // TODO: rename to isDappActive (see above)
    isDappActiveAndNetworksMatched,
  };
};
