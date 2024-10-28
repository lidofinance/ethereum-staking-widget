import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import invariant from 'tiny-invariant';

import { CHAINS, isSDKSupportedL2Chain } from 'consts/chains';
import { useAccount } from 'wagmi';
import { config } from 'config';
import { useLidoSDK } from './lido-sdk';
import { wagmiChainMap } from './web3-provider';

export enum DAPP_CHAIN_TYPE {
  Ethereum = 'Ethereum',
  Optimism = 'Optimism',
}

type DappChainContextValue = {
  chainType: DAPP_CHAIN_TYPE;
  setChainType: React.Dispatch<React.SetStateAction<DAPP_CHAIN_TYPE>>;
  supportedChainIds: number[];
  isChainTypeMatched: boolean;
};

type UseDappChainValue = {
  // Current DApp chain ID (may not match with chainType)
  chainId: number;
  // Chain ID by current chainType
  chainTypeChainId: number;

  isSupportedChain: boolean;
  supportedChainTypes: DAPP_CHAIN_TYPE[];
  supportedChainLabels: string[];
} & DappChainContextValue;

const DappChainContext = createContext<DappChainContextValue | null>(null);
DappChainContext.displayName = 'DappChainContext';

const ETHEREUM_CHAINS = new Set([
  CHAINS.Mainnet,
  CHAINS.Holesky,
  CHAINS.Sepolia,
]);

const OPTIMISM_CHAINS = new Set([CHAINS.Optimism, CHAINS.OptimismSepolia]);

const getChainTypeByChainId = (chainId?: number): DAPP_CHAIN_TYPE | null => {
  if (!chainId) return null;
  if (ETHEREUM_CHAINS.has(chainId)) {
    return DAPP_CHAIN_TYPE.Ethereum;
  } else if (OPTIMISM_CHAINS.has(chainId)) {
    return DAPP_CHAIN_TYPE.Optimism;
  }
  return null;
};

const getChainIdByChainType = (
  chainType: DAPP_CHAIN_TYPE,
  supportedChainIds,
): number | null => {
  switch (chainType) {
    case DAPP_CHAIN_TYPE.Ethereum:
      return (
        Array.from(ETHEREUM_CHAINS).find((id) =>
          supportedChainIds.includes(id),
        ) ?? null
      );
    case DAPP_CHAIN_TYPE.Optimism:
      return (
        Array.from(OPTIMISM_CHAINS).find((id) =>
          supportedChainIds.includes(id),
        ) ?? null
      );
    default:
      return null;
  }
};

export const useDappChain = (): UseDappChainValue => {
  const context = useContext(DappChainContext);
  invariant(context, 'useDappChain was used outside of DappChainProvider');

  const { chainId: dappChain } = useLidoSDK();
  const { chainId: walletChain } = useAccount();

  return useMemo(() => {
    const supportedChainTypes = context.supportedChainIds
      .map(getChainTypeByChainId)
      .filter(
        (chainType, index, array) =>
          // duplicate/invalid pruning + stable order
          chainType && array.indexOf(chainType) === index,
      ) as DAPP_CHAIN_TYPE[];

    const supportedChainLabels = supportedChainTypes.map((chainType) => {
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
    });

    const chainTypeChainId =
      getChainIdByChainType(context.chainType, context.supportedChainIds) ||
      config.defaultChain;

    return {
      ...context,
      chainId: context.supportedChainIds.includes(dappChain)
        ? dappChain
        : config.defaultChain,
      chainTypeChainId,
      isSupportedChain: walletChain
        ? context.supportedChainIds.includes(walletChain)
        : true,
      supportedChainTypes,
      supportedChainLabels,
    };
  }, [context, dappChain, walletChain]);
};

export const SupportL2Chains: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { chainId: walletChainId } = useAccount();
  const [chainType, setChainType] = useState<DAPP_CHAIN_TYPE>(
    DAPP_CHAIN_TYPE.Ethereum,
  );

  useEffect(() => {
    if (!walletChainId) return;

    const newChainType = getChainTypeByChainId(walletChainId);

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
          isChainTypeMatched:
            chainType === getChainTypeByChainId(walletChainId),
        }),
        [chainType, walletChainId],
      )}
    >
      {children}
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
    {children}
  </DappChainContext.Provider>
);
