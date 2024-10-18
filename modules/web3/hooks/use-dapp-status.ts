import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { isSDKSupportedL2Chain, LIDO_MULTICHAIN_CHAINS } from 'consts/chains';

import { useConfig } from 'config';
import { useDappChain } from 'modules/web3/web3-provider/dapp-chain';

export const useDappStatus = () => {
  const { multiChainBanner } = useConfig().externalConfig;
  const {
    address,
    chainId: walletChainId,
    isConnected: isWalletConnected,
  } = useAccount();

  // uses singular global context to get chooses dapp chain
  const {
    isChainTypeMatched,
    chainType,
    currentSupportedChain,
    isSupportedChain,
  } = useDappChain();

  return useMemo(() => {
    const isLidoMultichainChain =
      !!walletChainId &&
      !!LIDO_MULTICHAIN_CHAINS[walletChainId] &&
      !isSupportedChain &&
      multiChainBanner.includes(walletChainId);

    const isAccountActive = walletChainId
      ? isWalletConnected && isSupportedChain
      : false;

    const isDappActiveOnL1 =
      isAccountActive &&
      !isSDKSupportedL2Chain(walletChainId) &&
      isChainTypeMatched;

    const isDappActiveOnL2 =
      isAccountActive &&
      isSDKSupportedL2Chain(walletChainId) &&
      isChainTypeMatched;

    const isDappActive = isAccountActive && isChainTypeMatched;

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
      isChainTypeMatched,
      chainType,
    };
  }, [
    walletChainId,
    multiChainBanner,
    isWalletConnected,
    isSupportedChain,
    isChainTypeMatched,
    currentSupportedChain,
    address,
    chainType,
  ]);
};
