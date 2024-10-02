import { createContext, useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';
import { useChainId, usePublicClient, useWalletClient } from 'wagmi';

import { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import { LidoSDKL2 } from '@lidofinance/lido-ethereum-sdk/l2';

import { useGetRpcUrlByChainId } from 'config/rpc';
import { useTokenTransferSubscription } from 'shared/hooks/use-balance';

type LidoSDKContextValue = {
  lidoSDKCore: LidoSDKCore;
  lidoSDKL2: LidoSDKL2;
  lidoSDKstETH: LidoSDKstETH;
  lidoSDKwstETH: LidoSDKwstETH;
  subscribeToTokenUpdates: ReturnType<typeof useTokenTransferSubscription>;
};

const LidoSDKContext = createContext<LidoSDKContextValue | null>(null);
LidoSDKContext.displayName = 'LidoSDKContext';

export const useLidoSDK = () => {
  const value = useContext(LidoSDKContext);
  invariant(value, 'useLidoSDK was used outside of LidoSDKProvider');
  return value;
};

export const LidoSDKProvider = ({ children }: React.PropsWithChildren) => {
  const subscribe = useTokenTransferSubscription();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const getRpcUrl = useGetRpcUrlByChainId();
  const fallbackRpcUrl = !publicClient ? getRpcUrl(chainId) : undefined;
  const { data: walletClient } = useWalletClient();

  const contextValue = useMemo(() => {
    // @ts-expect-error: typing (rpcProvider + rpcUrls)
    const core = new LidoSDKCore({
      chainId,
      logMode: 'none',
      rpcProvider: publicClient,
      web3Provider: walletClient,
      // viem client can be unavailable on ipfs+dev first renders
      rpcUrls: !publicClient && fallbackRpcUrl ? [fallbackRpcUrl] : undefined,
    });

    const stETH = new LidoSDKstETH({ core });
    const wstETH = new LidoSDKwstETH({ core });
    const l2 = new LidoSDKL2({ core });

    return {
      lidoSDKCore: core,
      lidoSDKstETH: stETH,
      lidoSDKwstETH: wstETH,
      lidoSDKL2: l2,
      subscribeToTokenUpdates: subscribe,
    };
  }, [chainId, fallbackRpcUrl, publicClient, subscribe, walletClient]);
  return (
    <LidoSDKContext.Provider value={contextValue}>
      {children}
    </LidoSDKContext.Provider>
  );
};
