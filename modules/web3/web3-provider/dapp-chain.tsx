import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  PropsWithChildren,
} from 'react';
import invariant from 'tiny-invariant';

import { CHAINS, isSDKSupportedL2Chain } from 'consts/chains';
import { useAccount } from 'wagmi';
import { config } from 'config';
import { useLidoSDK } from './lido-sdk';

export enum DAPP_CHAIN_TYPE {
  Ethereum = 'ETHEREUM',
  Optimism = 'OPTIMISM',
}

const ETHEREUM_CHAINS = new Set([
  CHAINS.Mainnet,
  CHAINS.Holesky,
  CHAINS.Sepolia,
]);

const OPTIMISM_CHAINS = new Set([CHAINS.Optimism, CHAINS.OptimismSepolia]);

const getChainMainnetNameByChainId = (
  chainId?: number,
): DAPP_CHAIN_TYPE | null => {
  if (!chainId) return null;
  if (ETHEREUM_CHAINS.has(chainId)) {
    return DAPP_CHAIN_TYPE.Ethereum;
  } else if (OPTIMISM_CHAINS.has(chainId)) {
    return DAPP_CHAIN_TYPE.Optimism;
  }
  return null;
};

type DappChainContextValue = {
  chainType: DAPP_CHAIN_TYPE;
  setChainType: React.Dispatch<React.SetStateAction<DAPP_CHAIN_TYPE>>;
  supportedChainIds: number[];
  isChainTypeMatched: boolean;
  isChainTypeUnlocked: boolean;
};

type UseDappChainValue = {
  currentSupportedChain: number;
  isSupportedChain: boolean;
} & DappChainContextValue;

const DappChainContext = createContext<DappChainContextValue | null>(null);
DappChainContext.displayName = 'DappChainContext';

export const useDappChain = (): UseDappChainValue => {
  const context = useContext(DappChainContext);
  invariant(context, 'useDappChain was used outside of DappChainProvider');
  const { chainId: dappChain } = useLidoSDK();
  const { chainId: walletChain } = useAccount();
  return useMemo(() => {
    return {
      ...context,
      currentSupportedChain: context.supportedChainIds.includes(dappChain)
        ? dappChain
        : config.defaultChain,
      isSupportedChain: walletChain
        ? context.supportedChainIds.includes(walletChain)
        : true,
    };
  }, [context, dappChain, walletChain]);
};

export const DappChainProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { chainId: walletChainId } = useAccount();
  const [chainType, setChainType] = useState<DAPP_CHAIN_TYPE>(
    DAPP_CHAIN_TYPE.Ethereum,
  );

  // syncs wallet chain to chain type
  useEffect(() => {
    if (!walletChainId) return;

    const newChainType = getChainMainnetNameByChainId(walletChainId);

    if (!newChainType) return;

    setChainType(newChainType);
  }, [walletChainId]);

  return (
    <DappChainContext.Provider
      value={useMemo(
        () => ({
          chainType,
          setChainType,
          supportedChainIds: config.supportedChains,
          isChainTypeUnlocked: true,
          isChainTypeMatched:
            chainType === getChainMainnetNameByChainId(walletChainId),
        }),
        [chainType, walletChainId],
      )}
    >
      {children}
    </DappChainContext.Provider>
  );
};

const onlyL1Chains = config.supportedChains.filter(
  (chain) => !isSDKSupportedL2Chain(chain),
);

export const SupportOnlyL1Chains = ({ children }: PropsWithChildren) => {
  const originalContext = useContext(DappChainContext);
  invariant(
    originalContext,
    'SupportOnlyL1Chains was used outside of DappChainProvider',
  );
  const onlyL1ChainsContext = useMemo(
    () => ({
      ...originalContext,
      chainType: DAPP_CHAIN_TYPE.Ethereum,
      isChainTypeUnlocked: false,
      supportedChainIds: onlyL1Chains,
    }),
    [originalContext],
  );

  // When this provider is mounted it resets chainType to Ethereum
  // though context override shims chainType, this allows to sync state between pages
  useEffect(() => {
    originalContext.setChainType(DAPP_CHAIN_TYPE.Ethereum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DappChainContext.Provider value={onlyL1ChainsContext}>
      {children}
    </DappChainContext.Provider>
  );
};
