import { createContext, useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';
import { usePublicClient, useWalletClient } from 'wagmi';

import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';
import { CHAINS, LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import { LidoSDKL2 } from '@lidofinance/lido-ethereum-sdk/l2';

import { useDappChain } from './dapp-chain';

type LidoSDKL2ContextValue = {
  chainId: CHAINS;
  core: LidoSDKCore;
  l2: LidoSDKL2;
  isL2: boolean;
};

const LidoSDKL2Context = createContext<LidoSDKL2ContextValue | null>(null);
LidoSDKL2Context.displayName = 'LidoSDKL2Context';

export const useLidoSDKL2 = () => {
  const value = useContext(LidoSDKL2Context);
  invariant(value, 'useLidoSDKL2 was used outside of LidoSDKL2Provider');
  return value;
};

export const LidoSDKL2Provider = ({ children }: React.PropsWithChildren) => {
  const { chainId } = useDappChain();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });

  const contextValue = useMemo(() => {
    // @ts-expect-error: typing (viem + LidoSDK)
    const core = new LidoSDKCore({
      chainId,
      logMode: 'none',
      rpcProvider: publicClient,
      web3Provider: walletClient,
    });

    return {
      chainId: core.chainId,
      core,
      l2: new LidoSDKL2({ core }),
      isL2: !!LIDO_L2_CONTRACT_ADDRESSES[chainId as CHAINS],
    };
  }, [chainId, publicClient, walletClient]);
  return (
    <LidoSDKL2Context.Provider value={contextValue}>
      {children}
    </LidoSDKL2Context.Provider>
  );
};
