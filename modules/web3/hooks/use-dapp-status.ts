import { useAccount, useChains } from 'wagmi';
import { isSDKSupportedL2Chain } from 'consts/chains';

import { useDappChain } from 'modules/web3/web3-provider/dapp-chain';

export const useDappStatus = () => {
  const {
    address,
    chainId: walletChainId,
    isConnected: isWalletConnected,
  } = useAccount();

  // this can change between pages based on their dapp-chain context(or lack of)
  const dappChain = useDappChain();

  const { isSupportedChain, isChainTypeMatched } = dappChain;

  const isAccountActive = walletChainId
    ? isWalletConnected && isSupportedChain
    : false;

  const isL2 = isSDKSupportedL2Chain(walletChainId);

  const chains = useChains();
  const currentChain = chains.find((chain) => chain.id === walletChainId);
  const isTestnet = currentChain ? currentChain.testnet === true : false;

  const isDappActive = isAccountActive && isChainTypeMatched;

  const isDappActiveOnL1 = isDappActive && !isL2;

  const isDappActiveOnL2 = isDappActive && isL2;

  // no useMemo because memoisation is more expensive than boolean flags
  // hook is used in many places and every usage would create separate memoisation
  return {
    ...dappChain,
    isAccountActive,
    isDappActive,
    isDappActiveOnL2,
    isDappActiveOnL1,
    isWalletConnected,
    walletChainId,
    address,
    isTestnet,
  };
};
