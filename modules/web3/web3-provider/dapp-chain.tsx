import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import invariant from 'tiny-invariant';

import { useConnection } from 'wagmi';
import type { Chain } from 'wagmi/chains';

import {
  isSupportedL2Chain,
  isSupportedL2StakingChain,
  isSupportedL1Chain,
  isSupportedL2WrapChain,
} from 'consts/chains';
import { config } from 'config';
import { ModalProvider } from 'providers/modal-provider';

import {
  getChainTypeByChainId,
  DAPP_CHAIN_TYPE,
  SupportedChainLabels,
  wagmiChainMap,
} from '../consts';

import { LidoSDKProvider } from './lido-sdk';
import { LidoSDKL2Provider } from './lido-sdk-l2';
import { useSwitchChain } from './switch-chain';

type DappChainContextValue = {
  // Current DApp chain ID (may not match with wallet chain)
  chainId: number;
  setChainId: React.Dispatch<React.SetStateAction<number>>;
  requestChangeChain: (newChainId: number) => void;
  isSwitchChainPending: boolean;
  canSwitchChain: boolean;
  chainType: DAPP_CHAIN_TYPE;

  wagmiChain: Chain;
  wagmiDefaultChain: Chain;
  wagmiWalletChain: Chain | undefined;

  isChainIdOnL2: boolean;
  supportedChainIds: number[];
};

type UseDappChainValue = {
  isChainMatched: boolean;
  isSupportedChain: boolean;
  supportedChainLabels: SupportedChainLabels;
} & DappChainContextValue;

const DappChainContext = createContext<DappChainContextValue | null>(null);
DappChainContext.displayName = 'DappChainContext';

export const useDappChain = (): UseDappChainValue => {
  const context = useContext(DappChainContext);
  invariant(context, 'useDappChain was used outside of DappChainProvider');
  const { chainId: walletChain } = useConnection();

  return useMemo(() => {
    const supportedChainTypes = context.supportedChainIds
      .map(getChainTypeByChainId)
      .filter(
        (chainType, index, array) =>
          // duplicate/invalid pruning + stable order
          chainType && array.indexOf(chainType) === index,
      ) as DAPP_CHAIN_TYPE[];

    const MAINNET = 'Mainnet';

    const getChainLabelByType = (chainType: DAPP_CHAIN_TYPE) => {
      // all chain names for chainType
      const chainNamesForType = context.supportedChainIds
        .filter((id) => chainType == getChainTypeByChainId(id))
        .map((id) => wagmiChainMap[id])
        .map((chain) => (chain.testnet ? chain.name : MAINNET));

      // Example: Ethereum or Ethereum(Mainnet,Hoodi,Sepolia,Holesky)
      return chainNamesForType.length === 1 && chainNamesForType[0] === MAINNET
        ? chainType
        : `${chainType}(${chainNamesForType.join(',')})`;
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
      isChainMatched: walletChain ? context.chainId === walletChain : true,
      isSupportedChain: walletChain
        ? context.supportedChainIds.includes(walletChain)
        : true,
      supportedChainLabels,
    };
  }, [context, walletChain]);
};

/**
 * Common logic for handling supported chains, including chain switching and maintaining the current chain state.
 */
const useSupportedChainLogic = (
  isChainSupported: (chainId: number) => boolean,
): DappChainContextValue => {
  // State for current chain ID as source of truth over wagmi state
  // wagmi state will enable all supported chains but our local state will override it
  const [chainId, setChainId] = useState<number>(config.defaultChain);

  // wagmi state for the connected wallet
  const { chainId: walletChainId, isConnected } = useConnection();

  // hook for switching chain state in wagmi/wallet state
  const {
    trySwitchChain,
    isPending: isSwitchChainPending,
    canSwitchChain,
  } = useSwitchChain();

  // callback that requests a chain change, soft syncing on edge-cases
  const requestChangeChain = useCallback(
    async (newChainId: number) => {
      if (!canSwitchChain) {
        return setChainId(newChainId);
      }

      const { success } = await trySwitchChain(newChainId);
      // if the chain switch was unsuccessful, we still set the chainId to the newChainId
      if (!success) {
        return setChainId(newChainId);
      }
      // success is no-op, wagmi changes the state and we sync in effect below
    },
    [trySwitchChain, canSwitchChain],
  );

  // smart sync wagmi state to local state
  useEffect(() => {
    if (
      !walletChainId ||
      !config.supportedChains.includes(walletChainId) ||
      !isChainSupported(walletChainId)
    ) {
      // This code resets 'chainId' to 'config.defaultChain' when the wallet is disconnected.
      // It also works on the first rendering, but we don't care.
      setChainId(config.defaultChain);
      return;
    }

    if (isConnected) {
      setChainId(walletChainId);
    }
  }, [walletChainId, isConnected, isChainSupported]);

  return useMemo(
    () => ({
      chainId,
      setChainId,
      chainType: getChainTypeByChainId(chainId) ?? DAPP_CHAIN_TYPE.Ethereum,
      requestChangeChain,
      isSwitchChainPending,
      canSwitchChain,

      wagmiChain: wagmiChainMap[chainId],
      wagmiDefaultChain: wagmiChainMap[config.defaultChain],
      wagmiWalletChain: walletChainId
        ? wagmiChainMap[walletChainId]
        : undefined,

      isChainIdOnL2: isSupportedL2Chain(chainId),
      supportedChainIds: config.supportedChains.filter((chain) =>
        isChainSupported(chain),
      ),
    }),
    [
      canSwitchChain,
      chainId,
      isChainSupported,
      isSwitchChainPending,
      requestChangeChain,
      walletChainId,
    ],
  );
};

/**
 * Enables L1 and L2 chains with wrap Functionality
 */
export const SupportL1AndL2WrapChains: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const isChainSupported = useCallback(
    (chainId: number) =>
      isSupportedL1Chain(chainId) || isSupportedL2WrapChain(chainId),
    [],
  );
  const contextValue = useSupportedChainLogic(isChainSupported);

  return (
    <DappChainContext.Provider value={contextValue}>
      <LidoSDKL2Provider>
        {/* Some modals depend on the LidoSDKL2Provider */}
        <ModalProvider>{children}</ModalProvider>
      </LidoSDKL2Provider>
    </DappChainContext.Provider>
  );
};

/**
 * Enables L1 and L2 chains with staking functionality
 */
export const SupportL1andL2StakingChains: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const isChainSupported = useCallback(
    (chainId: number) =>
      isSupportedL1Chain(chainId) || isSupportedL2StakingChain(chainId),
    [],
  );
  const contextValue = useSupportedChainLogic(isChainSupported);

  return (
    <DappChainContext.Provider value={contextValue}>
      <LidoSDKL2Provider>
        {/* Some modals depend on the LidoSDKL2Provider */}
        <ModalProvider>{children}</ModalProvider>
      </LidoSDKL2Provider>
    </DappChainContext.Provider>
  );
};

/**
 * Enables only L1 chains - Ethereum Mainnet and testnets
 * @remarks
 * Value of this context only allows L1 chains and no chain switch
 * this is actual for most pages and can be overriden by SupportL2Chains on per page basis
 * for safety reasons this cannot be default context value
 * in order to prevent accidental useDappChain/useDappStatus misusage in top-lvl components
 */
export const SupportOnlyL1Chains: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const isOnlyL1Chain = useCallback(
    (chainId: number) => isSupportedL1Chain(chainId),
    [],
  );
  const contextValue = useSupportedChainLogic(isOnlyL1Chain);

  return (
    <DappChainContext.Provider value={contextValue}>
      <LidoSDKProvider>
        {/* Stub LidoSDKL2Provider for hooks that gives isL2:false. Will be overriden in SupportL2Chains */}
        <LidoSDKL2Provider>{children}</LidoSDKL2Provider>
      </LidoSDKProvider>
    </DappChainContext.Provider>
  );
};
