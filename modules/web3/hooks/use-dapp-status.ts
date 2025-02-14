import { useAccount } from 'wagmi';

import { useDappChain } from 'modules/web3/web3-provider/dapp-chain';

export const useDappStatus = () => {
  const {
    address,
    chainId: walletChainId,
    isConnected: isWalletConnected,
  } = useAccount();

  // this can change between pages based on their dapp-chain context(or lack of)
  const dappChain = useDappChain();

  const { isChainIdOnL2, isSupportedChain } = dappChain;

  const isAccountActive = walletChainId
    ? isWalletConnected && isSupportedChain
    : false;

  const isDappActive = isAccountActive;
  const isDappActiveOnL1 = isDappActive && !isChainIdOnL2;
  const isDappActiveOnL2 = isDappActive && isChainIdOnL2;

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
  };
};
