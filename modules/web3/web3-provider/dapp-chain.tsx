import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import invariant from 'tiny-invariant';

import {
  CHAINS,
  isSDKSupportedL2Chain,
  isSDKSupportedChain,
} from 'consts/chains';
import { useAccount } from 'wagmi';
import { config } from 'config';
import { ModalProvider } from 'providers/modal-provider';

import { wagmiChainMap } from './web3-provider';
import { LidoSDKProvider } from './lido-sdk';
import { LidoSDKL2Provider } from './lido-sdk-l2';

export enum DAPP_CHAIN_TYPE {
  Ethereum = 'Ethereum',
  Optimism = 'Optimism',
  Soneium = 'Soneium',
  Unichain = 'Unichain',
}

type DappChainContextValue = {
  chainType: DAPP_CHAIN_TYPE;
  setChainType: React.Dispatch<React.SetStateAction<DAPP_CHAIN_TYPE>>;
  supportedChainIds: number[];
  isChainTypeMatched: boolean;
  isChainTypeOnL2: boolean;
};

export type SupportedChainLabels = {
  [key in DAPP_CHAIN_TYPE]: string;
};

type UseDappChainValue = {
  // Current DApp chain ID (may not match with chainType)
  chainId: number;
  // Chain ID by current chainType
  chainTypeChainId: number;

  isSupportedChain: boolean;
  supportedChainTypes: DAPP_CHAIN_TYPE[];
  supportedChainLabels: SupportedChainLabels;
} & DappChainContextValue;

const DappChainContext = createContext<DappChainContextValue | null>(null);
DappChainContext.displayName = 'DappChainContext';

const ETHEREUM_CHAINS = new Set([
  CHAINS.Mainnet,
  CHAINS.Holesky,
  CHAINS.Hoodi,
  CHAINS.Sepolia,
]);

const OPTIMISM_CHAINS = new Set([CHAINS.Optimism, CHAINS.OptimismSepolia]);
const SONEIUM_CHAINS = new Set([CHAINS.Soneium, CHAINS.SoneiumMinato]);
const UNICHAIN_CHAINS = new Set([CHAINS.Unichain, CHAINS.UnichainSepolia]);

const getChainTypeByChainId = (chainId?: number): DAPP_CHAIN_TYPE | null => {
  if (!chainId) return null;
  if (ETHEREUM_CHAINS.has(chainId)) {
    return DAPP_CHAIN_TYPE.Ethereum;
  } else if (OPTIMISM_CHAINS.has(chainId)) {
    return DAPP_CHAIN_TYPE.Optimism;
  } else if (SONEIUM_CHAINS.has(chainId)) {
    return DAPP_CHAIN_TYPE.Soneium;
  } else if (UNICHAIN_CHAINS.has(chainId)) {
    return DAPP_CHAIN_TYPE.Unichain;
  }
  return null;
};

// At the current stage of the widget we don't care what ID is returned:
// - 'chainTypeChainId' is only used for statistics;
// - on the prod environment, the 'function map' of 'chainType' to 'chainId' will be 1 to 1 (bijective mapping).
const getChainIdByChainType = (
  chainType: DAPP_CHAIN_TYPE,
  supportedChainIds: number[],
): number | undefined =>
  supportedChainIds.find((id) => getChainTypeByChainId(id) === chainType);

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

    const chainTypeChainId =
      getChainIdByChainType(context.chainType, context.supportedChainIds) ??
      config.defaultChain;

    return {
      ...context,
      chainId:
        walletChain &&
        context.supportedChainIds.includes(walletChain) &&
        isSDKSupportedChain(walletChain)
          ? walletChain
          : config.defaultChain,
      chainTypeChainId,
      isSupportedChain: walletChain
        ? context.supportedChainIds.includes(walletChain) &&
          isSDKSupportedChain(walletChain)
        : true,
      supportedChainTypes,
      supportedChainLabels,
    };
  }, [context, walletChain]);
};

export const SupportL2Chains: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { chainId: walletChainId, isConnected } = useAccount();
  const [chainType, setChainType] = useState<DAPP_CHAIN_TYPE>(
    DAPP_CHAIN_TYPE.Ethereum,
  );

  useEffect(() => {
    if (!walletChainId || !config.supportedChains.includes(walletChainId)) {
      // This code resets 'chainType' to ETH when the wallet is disconnected.
      // It also works on the first rendering, but we don't care, because the 'chainType' by default is ETH.
      // Don't use it if you need to do something strictly, only when the wallet is disconnected.
      setChainType(DAPP_CHAIN_TYPE.Ethereum);
      return;
    }

    if (isConnected) {
      const newChainType = getChainTypeByChainId(walletChainId);
      if (newChainType) setChainType(newChainType);
    }
  }, [walletChainId, isConnected, setChainType]);

  return (
    <DappChainContext.Provider
      value={useMemo(
        () => ({
          chainType,
          setChainType,
          supportedChainIds: config.supportedChains,
          isChainTypeMatched:
            chainType === getChainTypeByChainId(walletChainId),
          // At the moment a simple check is enough for us,
          // however in the future we will either rethink this flag
          // or use an array or Set (for example with L2_DAPP_CHAINS_TYPE)
          isChainTypeOnL2:
            chainType === DAPP_CHAIN_TYPE.Optimism ||
            chainType === DAPP_CHAIN_TYPE.Soneium ||
            chainType === DAPP_CHAIN_TYPE.Unichain,
        }),
        [chainType, walletChainId],
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
  chainType: DAPP_CHAIN_TYPE.Ethereum,
  // only L1 chains
  supportedChainIds: config.supportedChains.filter(
    (chain) => !isSDKSupportedL2Chain(chain),
  ),
  isChainTypeMatched: true,
  isChainTypeOnL2: false,
  setChainType: () => {},
};

// Value of this context only allows L1 chains and no chain switch
// this is actual for most pages and can be overriden by SupportL2Chains on per page basis
// for safety reasons this cannot be default context value
// in order to prevent accidental useDappChain/useDappStatus misusage in top-lvl components
export const SupportL1Chains: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <DappChainContext.Provider value={onlyL1ChainsValue}>
    <LidoSDKProvider>
      {/* Stub LidoSDKL2Provider for hooks that gives isL2:false. Will be overriden in SupportL2Chains */}
      <LidoSDKL2Provider>{children}</LidoSDKL2Provider>
    </LidoSDKProvider>
  </DappChainContext.Provider>
);
