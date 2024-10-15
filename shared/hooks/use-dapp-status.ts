import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { isSDKSupportedL2Chain, LIDO_MULTICHAIN_CHAINS } from 'consts/chains';

import { useConfig } from 'config';
import { useDappChain } from 'providers/dapp-chain';
import {
  useCurrentSupportedChain,
  useIsConnectedWithSupportedChain,
} from 'providers/supported-chain';

export const useDappStatus = () => {
  const { multiChainBanner } = useConfig().externalConfig;
  const {
    address,
    chainId: walletChainId,
    isConnected: isWalletConnected,
  } = useAccount();
  const currentSupportedChain = useCurrentSupportedChain();
  const { isSupportedChain } = useIsConnectedWithSupportedChain();
  const { isMatchDappChainAndWalletChain } = useDappChain();

  return useMemo(() => {
    const isLidoMultichainChain =
      !!walletChainId &&
      !!LIDO_MULTICHAIN_CHAINS[walletChainId] &&
      multiChainBanner.includes(walletChainId);

    const isAccountActive = walletChainId
      ? isWalletConnected && isSupportedChain
      : false;

    const isDappActiveOnL1 =
      isAccountActive &&
      !isSDKSupportedL2Chain(walletChainId) &&
      isMatchDappChainAndWalletChain(walletChainId);

    const isDappActiveOnL2 =
      isAccountActive &&
      isSDKSupportedL2Chain(walletChainId) &&
      isMatchDappChainAndWalletChain(walletChainId);

    const isDappActive =
      isAccountActive && isMatchDappChainAndWalletChain(walletChainId);

    return {
      isAccountActive,
      isDappActive,
      isDappActiveOnL2,
      isDappActiveOnL1,
      isLidoMultichainChain,
      isSupportedChain,
      isWalletConnected,
      chainId: currentSupportedChain,
      walletChainId,
      address,
    };
  }, [
    walletChainId,
    multiChainBanner,
    isWalletConnected,
    isSupportedChain,
    isMatchDappChainAndWalletChain,
    currentSupportedChain,
    address,
  ]);
};
