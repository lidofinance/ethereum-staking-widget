import { createContext, useContext, useMemo } from 'react';
import { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import {
  LidoSDKL2Steth,
  LidoSDKL2Wsteth,
  LidoSDKL2,
} from '@lidofinance/lido-ethereum-sdk/l2';
import invariant from 'tiny-invariant';
import { useChainId, useClient, useConnectorClient } from 'wagmi';

import { usePublicClient, useWalletClient } from 'wagmi';

import { useTokenTransferSubscription } from 'shared/hooks/use-balance';
import { useGetRpcUrlByChainId } from 'config/rpc';

type LidoSDKContextValue = {
  core: LidoSDKCore;
  steth: LidoSDKstETH;
  wsteth: LidoSDKwstETH;
  l2: LidoSDKL2;
  l2Steth: LidoSDKL2Steth;
  l2Wsteth: LidoSDKL2Wsteth;
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
  const publicClient = useClient();
  const chainId = useChainId();
  const getRpcUrl = useGetRpcUrlByChainId();
  const fallbackRpcUrl = !publicClient ? getRpcUrl(chainId) : undefined;
  const { data: walletClient } = useConnectorClient();

  const publicClient2 = usePublicClient();
  const { data: walletClient2 } = useWalletClient();

  const sdk = useMemo(() => {
    const core = new LidoSDKCore({
      chainId,
      logMode: 'none',
      rpcProvider: publicClient as any,
      web3Provider: walletClient as any,
      // viem client can be unavailable on ipfs+dev first renders
      rpcUrls: !publicClient && fallbackRpcUrl ? [fallbackRpcUrl] : undefined,
    });

    const l2 = new LidoSDKL2({
      chainId,
      logMode: 'info',
      rpcProvider: publicClient2,
      web3Provider: walletClient2,
      // viem client can be unavailable on ipfs+dev first renders
      // rpcUrls: !publicClient && fallbackRpcUrl ? [fallbackRpcUrl] : undefined,
    });

    const steth = new LidoSDKstETH({ core });
    const wsteth = new LidoSDKwstETH({ core });

    const l2Steth = l2.steth;
    const l2Wsteth = l2.wsteth;

    return {
      core,
      steth,
      wsteth,
      l2,
      l2Steth,
      l2Wsteth,
      subscribeToTokenUpdates: subscribe,
    };
  }, [
    chainId,
    fallbackRpcUrl,
    publicClient,
    publicClient2,
    subscribe,
    walletClient,
    walletClient2,
  ]);
  return (
    <LidoSDKContext.Provider value={sdk}>{children}</LidoSDKContext.Provider>
  );
};
