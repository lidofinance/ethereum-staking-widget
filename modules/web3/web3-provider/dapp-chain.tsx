import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { useRouter } from 'next/router';
import invariant from 'tiny-invariant';

import { CHAINS } from 'consts/chains';
import { useAccount } from 'wagmi';

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
  isChainTypeUnlocked: boolean;
  isDappChainTypeMatched: boolean;
};

const DappChainContext = createContext<DappChainContextValue | null>(null);
DappChainContext.displayName = 'DappChainContext';

export const useDappChain = () => {
  const context = useContext(DappChainContext);
  invariant(context, 'useDappChain was used outside of DappChainProvider');
  return context;
};

export const DappChainProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { chainId: walletChainId } = useAccount();
  const router = useRouter();

  const isChainTypeUnlocked = useMemo(
    () => router.pathname === '/wrap/[[...mode]]',
    [router.pathname],
  );

  const [chainType, setChainType] = useState<DAPP_CHAIN_TYPE>(
    DAPP_CHAIN_TYPE.Ethereum,
  );

  useEffect(() => {
    if (!isChainTypeUnlocked) {
      setChainType(DAPP_CHAIN_TYPE.Ethereum);
    }
    if (!walletChainId) return;

    const newChainType = getChainMainnetNameByChainId(walletChainId);

    if (!newChainType) return;

    setChainType(newChainType);
  }, [walletChainId, isChainTypeUnlocked]);

  return (
    <DappChainContext.Provider
      value={useMemo(
        () => ({
          chainType,
          setChainType,
          isChainTypeUnlocked,
          isDappChainTypeMatched:
            chainType === getChainMainnetNameByChainId(walletChainId),
        }),
        [chainType, isChainTypeUnlocked, walletChainId],
      )}
    >
      {children}
    </DappChainContext.Provider>
  );
};
