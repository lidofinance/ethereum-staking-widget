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

  const dappStatuses = useMemo(() => {
    const isDappActive = chainId
      ? isWalletConnected && isSupportedChain
      : false;

    const isAccountActiveOnL1 = chainId
      ? isDappActive && !isSDKSupportedL2Chain(chainId)
      : false;
    const isAccountActiveOnL2 = chainId
      ? isDappActive && isSDKSupportedL2Chain(chainId)
      : false;

    const isDappActiveOnL1 = chainId
      ? isAccountActiveOnL1 && isMatchDappChainAndWalletChain(chainId)
      : false;
    const isDappActiveOnL2 = chainId
      ? isAccountActiveOnL2 && isMatchDappChainAndWalletChain(chainId)
      : false;

    const isDappActiveAndNetworksMatched = isDappActiveOnL1 || isDappActiveOnL2;

    return {
      // TODO: rename to isAccountActive
      isDappActive,

      isAccountActiveOnL1,
      isAccountActiveOnL2,

      isDappActiveOnL1,
      isDappActiveOnL2,

      // TODO: rename to isDappActive (see above)
      isDappActiveAndNetworksMatched,
    };
  }, [
    chainId,
    isMatchDappChainAndWalletChain,
    isSupportedChain,
    isWalletConnected,
  ]);

  return {
    isWalletConnected,
    isSupportedChain,
    isLidoMultichainChain,
    ...dappStatuses,
  };
};
