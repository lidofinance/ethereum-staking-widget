import React, { createContext, useContext, useState, useCallback } from 'react';
import invariant from 'tiny-invariant';

import { CHAINS } from 'consts/chains';

// import { config } from 'config';

export const ETHEREUM = 'ETHEREUM';
export const OPTIMISM = 'OPTIMISM';

export const CHAIN_NAMES = [ETHEREUM, OPTIMISM];
export type ChainNameType = (typeof CHAIN_NAMES)[number];

const getChainMainnetNameByChainId = (chainId: number): string => {
  if ([CHAINS.Mainnet, CHAINS.Holesky, CHAINS.Sepolia].includes(chainId)) {
    return ETHEREUM;
  } else if ([CHAINS.Optimism, CHAINS.OptimismSepolia].includes(chainId)) {
    return OPTIMISM;
  } else {
    // TODO: invariant?
    throw new Error('Invalid chainId');
  }
};

interface ContextValue {
  chainName: number;
  setChainName: React.Dispatch<React.SetStateAction<ChainNameType>>;
  getChainMainnetNameByChainId: (chainId: number) => ChainNameType;
  isMatchDappChainAndWalletChain: (walletChainId: number) => boolean;
}

const DappChainContext = createContext<ContextValue | undefined>(undefined);

export const useDappChain = () => {
  const context = useContext(DappChainContext);
  invariant(context, 'useDappChain was used outside of DappChainProvider');
  return context;
};

export const DappChainProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chainName, setChainName] = useState<ChainNameType>(ETHEREUM);

  const isMatchDappChainAndWalletChain = useCallback(
    (walletChainId: number): boolean => {
      return chainName === getChainMainnetNameByChainId(walletChainId);
    },
    [chainName],
  );

  return (
    <DappChainContext.Provider
      value={{
        chainName,
        setChainName,
        getChainMainnetNameByChainId,
        isMatchDappChainAndWalletChain,
      }}
    >
      {children}
    </DappChainContext.Provider>
  );
};
