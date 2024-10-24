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

  // this can change between pages based on their dapp-chain context(or lack of)
  const dappChain = useDappChain();

  const { isSupportedChain, isChainTypeMatched } = dappChain;

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

  // no useMemo because memoisation is more expensive than boolean flags
  // hook is used in many places and every usage would create separate memoisation
  return {
    ...dappChain,
    isAccountActive,
    isDappActive,
    isDappActiveOnL2,
    isDappActiveOnL1,
    isLidoMultichainChain,
    isWalletConnected,
    walletChainId,
    address,
  };
};
