import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import invariant from 'tiny-invariant';

import { useConnection } from 'wagmi';
import { Chain } from 'wagmi/chains';

import {
  isSDKSupportedChainAndChainIsL1,
  isSDKSupportedL2Chain,
  isSDKSupportedChain,
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

type DappChainContextValue = {
  // Current DApp chain ID (may not match with wallet chain)
  chainId: number;
  setChainId: React.Dispatch<React.SetStateAction<number>>;
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

      // Ethereum example:
      // - Ethereum
      // - or
      // - Ethereum(Mainnet,Hoodi,Sepolia,Holesky)
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
        ? context.supportedChainIds.includes(walletChain) &&
          isSDKSupportedChain(walletChain)
        : true,
      supportedChainLabels,
    };
  }, [context, walletChain]);
};

export const SupportL2Chains: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { chainId: walletChainId, isConnected } = useConnection();
  const [chainId, setChainId] = useState<number>(config.defaultChain);

  useEffect(() => {
    if (
      !walletChainId ||
      !config.supportedChains.includes(walletChainId) ||
      !isSDKSupportedChain(walletChainId)
    ) {
      // This code resets 'chainId' to 'config.defaultChain' when the wallet is disconnected.
      // It also works on the first rendering, but we don't care.
      setChainId(config.defaultChain);
      return;
    }

    if (isConnected) {
      setChainId(walletChainId);
    }
  }, [walletChainId, isConnected]);

  return (
    <DappChainContext.Provider
      value={useMemo(
        () => ({
          chainId,
          setChainId,
          chainType: getChainTypeByChainId(chainId) ?? DAPP_CHAIN_TYPE.Ethereum,

          wagmiChain: wagmiChainMap[chainId],
          wagmiDefaultChain: wagmiChainMap[config.defaultChain],
          wagmiWalletChain: walletChainId
            ? wagmiChainMap[walletChainId]
            : undefined,

          isChainIdOnL2: isSDKSupportedL2Chain(chainId) ?? false,
          supportedChainIds: config.supportedChains.filter((chain) =>
            isSDKSupportedChain(chain),
          ),
        }),
        [chainId, walletChainId],
      )}
    >
      <LidoSDKL2Provider>
        {/* Some modals depend on the LidoSDKL2Provider */}
        <ModalProvider>{children}</ModalProvider>
      </LidoSDKL2Provider>
    </DappChainContext.Provider>
  );
};

// Value of this context only allows L1 chains and no chain switch
// this is actual for most pages and can be overriden by SupportL2Chains on per page basis
// for safety reasons this cannot be default context value
// in order to prevent accidental useDappChain/useDappStatus misusage in top-lvl components
export const SupportL1Chains: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { chainId: walletChainId, isConnected } = useConnection();
  const [chainId, setChainId] = useState<number>(config.defaultChain);

  useEffect(() => {
    if (
      !walletChainId ||
      !config.supportedChains.includes(walletChainId) ||
      !isSDKSupportedChainAndChainIsL1(walletChainId)
    ) {
      // This code resets 'chainId' to 'config.defaultChain' when the wallet is disconnected.
      // It also works on the first rendering, but we don't care.
      setChainId(config.defaultChain);
      return;
    }

    if (isConnected) {
      setChainId(walletChainId);
    }
  }, [walletChainId, isConnected]);

  return (
    <DappChainContext.Provider
      value={useMemo(
        () => ({
          chainId,
          setChainId,
          chainType: DAPP_CHAIN_TYPE.Ethereum,

          wagmiChain: wagmiChainMap[chainId],
          wagmiDefaultChain: wagmiChainMap[config.defaultChain],
          wagmiWalletChain: walletChainId
            ? wagmiChainMap[walletChainId]
            : undefined,

          // only L1 chains
          isChainIdOnL2: false,
          supportedChainIds: config.supportedChains.filter(
            (chain) =>
              isSDKSupportedChain(chain) && !isSDKSupportedL2Chain(chain),
          ),
        }),
        [chainId, walletChainId],
      )}
    >
      <LidoSDKProvider>
        {/* Stub LidoSDKL2Provider for hooks that gives isL2:false. Will be overriden in SupportL2Chains */}
        <LidoSDKL2Provider>{children}</LidoSDKL2Provider>
      </LidoSDKProvider>
    </DappChainContext.Provider>
  );
};
