import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import invariant from 'tiny-invariant';

import { CHAINS, isSDKSupportedL2Chain } from 'consts/chains';
import { useAccount, useSwitchChain } from 'wagmi';
import { config } from 'config';
import { ModalProvider } from 'providers/modal-provider';

import { wagmiChainMap } from './web3-provider';
import { LidoSDKProvider } from './lido-sdk';
import { LidoSDKL2Provider } from './lido-sdk-l2';

export enum DAPP_CHAIN_TYPE {
  Ethereum = 'Ethereum',
  Optimism = 'Optimism',
}

export type SupportedChainLabels = {
  [key in DAPP_CHAIN_TYPE]: string;
};

type DappChainContextValue = {
  chainId: number;
  setChainId: React.Dispatch<number>;
  supportedL2: boolean;
  supportedChainIds: number[];
  isChainIdOnL2: boolean;
};

type UseDappChainValue = {
  isSupportedChain: boolean;
  isChainIdMatched: boolean;
  supportedChainLabels: SupportedChainLabels;
} & DappChainContextValue;

const DappChainContext = createContext<DappChainContextValue | null>(null);
DappChainContext.displayName = 'DappChainContext';

const ETHEREUM_CHAINS = new Set([
  CHAINS.Mainnet,
  CHAINS.Holesky,
  CHAINS.Sepolia,
]);

const OPTIMISM_CHAINS = new Set([CHAINS.Optimism, CHAINS.OptimismSepolia]);

export const getChainTypeByChainId = (
  chainId: number,
): DAPP_CHAIN_TYPE | null => {
  if (ETHEREUM_CHAINS.has(chainId)) {
    return DAPP_CHAIN_TYPE.Ethereum;
  } else if (OPTIMISM_CHAINS.has(chainId)) {
    return DAPP_CHAIN_TYPE.Optimism;
  }
  return null;
};

export const useDappChain = (): UseDappChainValue => {
  const context = useContext(DappChainContext);
  invariant(context, 'useDappChain was used outside of DappChainProvider');
  const { chainId: walletChain } = useAccount();

  return useMemo(() => {
    const supportedChainTypes = context.supportedChainIds
      .map(getChainTypeByChainId)
      .filter(
        (chainType, index, array) =>
          // duplicate/invalid pruning + stable order
          chainType && array.indexOf(chainType) === index,
      ) as DAPP_CHAIN_TYPE[];

    const getChainLabelByType = (chainType: DAPP_CHAIN_TYPE) => {
      // all testnets for chainType
      const testnetsForType = context.supportedChainIds
        .filter((id) => chainType == getChainTypeByChainId(id))
        .map((id) => wagmiChainMap[id])
        .filter((chain) => chain.testnet)
        .map((chain) => chain.name);

      return (
        chainType +
        (testnetsForType.length > 0 ? `(${testnetsForType.join(',')})` : '')
      );
    };

    const supportedChainLabels = supportedChainTypes.reduce(
      (acc, chainType) => ({
        ...acc,
        [chainType]: getChainLabelByType(chainType),
      }),
      {},
    ) as SupportedChainLabels;

    return {
      ...context,
      supportedChainLabels,
      isSupportedChain: walletChain
        ? context.supportedChainIds.includes(walletChain)
        : true,
      isChainIdMatched: walletChain === context.chainId,
    };
  }, [context, walletChain]);
};

export const SupportL2Chains: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { chainId: walletChain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [chainId, setChainIdInternal] = useState<number>(config.defaultChain);

  useEffect(() => {
    if (isConnected) {
      const chainId =
        walletChain && config.supportedChains.includes(walletChain)
          ? walletChain
          : config.defaultChain;

      setChainIdInternal(chainId);
    }
  }, [walletChain, isConnected, setChainIdInternal]);

  const handleSetChainId = useCallback<React.Dispatch<number>>(
    (newChainId) => {
      switchChain({ chainId: newChainId });
    },
    [switchChain],
  );

  return (
    <DappChainContext.Provider
      value={useMemo(
        () => ({
          chainId,
          setChainId: handleSetChainId,
          supportedL2: true,
          supportedChainIds: config.supportedChains,
          isChainIdOnL2:
            getChainTypeByChainId(chainId) === DAPP_CHAIN_TYPE.Optimism,
        }),
        [chainId, handleSetChainId],
      )}
    >
      <LidoSDKL2Provider>
        {/* Some modals depend on the LidoSDKL2Provider */}
        <ModalProvider>{children}</ModalProvider>
      </LidoSDKL2Provider>
    </DappChainContext.Provider>
  );
};

const onlyL1ChainsValue = {
  setChainId: () => {},
  // only L1 chains
  supportedL2: false,
  supportedChainIds: config.supportedChains.filter(
    (chain) => !isSDKSupportedL2Chain(chain),
  ),
  isChainIdOnL2: false,
};

// Value of this context only allows L1 chains and no chain switch
// this is actual for most pages and can be overriden by SupportL2Chains on per page basis
// for safety reasons this cannot be default context value
// in order to prevent accidental useDappChain/useDappStatus misusage in top-lvl components
export const SupportL1Chains: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { chainId: walletChain } = useAccount();

  return (
    <DappChainContext.Provider
      value={useMemo(
        () => ({
          ...onlyL1ChainsValue,
          chainId:
            walletChain &&
            onlyL1ChainsValue.supportedChainIds.includes(walletChain)
              ? walletChain
              : config.defaultChain,
        }),
        [walletChain],
      )}
    >
      <LidoSDKProvider>
        {/* Stub LidoSDKL2Provider for hooks that gives isL2:false. Will be overriden in SupportL2Chains */}
        <LidoSDKL2Provider>{children}</LidoSDKL2Provider>
      </LidoSDKProvider>
    </DappChainContext.Provider>
  );
};
