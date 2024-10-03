import React, { createContext, useContext, useState, useCallback } from 'react';
import invariant from 'tiny-invariant';

import { CHAINS } from 'consts/chains';

// import { config } from 'config';

export const ETHEREUM = 'ETHEREUM';
export const OPTIMISM = 'OPTIMISM';
export const UNKNOWN = 'UNKNOWN';

export type ChainNameType = 'ETHEREUM' | 'OPTIMISM';
type ChainNameOrUnknownType = ChainNameType | 'UNKNOWN';

const getChainMainnetNameByChainId = (
  chainId: number,
): ChainNameOrUnknownType => {
  if ([CHAINS.Mainnet, CHAINS.Holesky, CHAINS.Sepolia].includes(chainId)) {
    return ETHEREUM;
  } else if ([CHAINS.Optimism, CHAINS.OptimismSepolia].includes(chainId)) {
    return OPTIMISM;
  } else {
    return UNKNOWN;
  }
};

interface ContextValue {
  chainName: string;
  setChainName: React.Dispatch<React.SetStateAction<ChainNameType>>;
  getChainMainnetNameByChainId: (chainId: number) => ChainNameOrUnknownType;
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
