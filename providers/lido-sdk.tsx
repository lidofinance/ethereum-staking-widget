import { createContext, useContext, useMemo } from 'react';
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import invariant from 'tiny-invariant';
// import { useChainId, useClient, useWalletClient } from 'wagmi';
import { useChainId, usePublicClient, useWalletClient } from 'wagmi';

import { useGetRpcUrlByChainId } from 'config/rpc';
import { useTokenTransferSubscription } from 'shared/hooks/use-balance';

type LidoSDKContextValue = {
  sdk: LidoSDK;
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
  // TODO: useClient() or usePublicClient() ?
  // const publicClient = useClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const getRpcUrl = useGetRpcUrlByChainId();
  const fallbackRpcUrl = !publicClient ? getRpcUrl(chainId) : undefined;
  const { data: walletClient } = useWalletClient();

  const contextValue = useMemo(() => {
    // @ts-expect-error: typing
    const sdk = new LidoSDK({
      chainId: chainId,
      rpcProvider: publicClient,
      web3Provider: walletClient,
      logMode: 'none',
      // viem client can be unavailable on ipfs+dev first renders
      rpcUrls: !publicClient && fallbackRpcUrl ? [fallbackRpcUrl] : undefined,
    });

    return {
      sdk,
      subscribeToTokenUpdates: subscribe,
    };
  }, [chainId, fallbackRpcUrl, publicClient, subscribe, walletClient]);
  return (
    <LidoSDKContext.Provider value={contextValue}>
      {children}
    </LidoSDKContext.Provider>
  );
};
