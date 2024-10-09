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

    const isAccountActiveOnL1 = isDappActive && !isSDKSupportedL2Chain(chainId);

    const isAccountActiveOnL2 = isDappActive && isSDKSupportedL2Chain(chainId);

    const isDappActiveOnL1 =
      isAccountActiveOnL1 && isMatchDappChainAndWalletChain(chainId);

    const isDappActiveOnL2 =
      isAccountActiveOnL2 && isMatchDappChainAndWalletChain(chainId);

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
