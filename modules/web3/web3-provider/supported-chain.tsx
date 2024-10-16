import { config } from 'config';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { useLidoSDK } from './lido-sdk';
import { isSDKSupportedL2Chain } from 'consts/chains';
import { useAccount } from 'wagmi';

type SupportedChainContextValue = {
  chains: number[];
};

const context = createContext<SupportedChainContextValue>({
  chains: config.supportedChains,
});
context.displayName = 'SupportedChainsContext';

export const useSupportedChain = () => {
  const { chainId: dappChain } = useLidoSDK();
  const { chainId: walletChain } = useAccount();
  const { chains } = useContext(context);
  return useMemo(() => {
    return {
      currentSupportedChain: chains.includes(dappChain)
        ? dappChain
        : config.defaultChain,
      isSupportedChain: walletChain ? chains.includes(walletChain) : true,
    };
  }, [chains, dappChain, walletChain]);
};

const onlyL1Chains = {
  chains: config.supportedChains.filter(
    (chain) => !isSDKSupportedL2Chain(chain),
  ),
};

export const SupportOnlyL1Chains = ({ children }: PropsWithChildren) => {
  return <context.Provider value={onlyL1Chains}>{children}</context.Provider>;
};
