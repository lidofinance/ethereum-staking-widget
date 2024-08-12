import { createContext, useContext, useMemo } from 'react';
import { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import invariant from 'tiny-invariant';
import { useChainId, useClient, useConnectorClient } from 'wagmi';
import { useTokenTransferSubscription } from 'shared/hooks/use-balance';
import { useGetRpcUrlByChainId } from 'config/rpc';

type LidoSDKContextValue = {
  core: LidoSDKCore;
  steth: LidoSDKstETH;
  wsteth: LidoSDKwstETH;
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

  const sdk = useMemo(() => {
    const core = new LidoSDKCore({
      chainId,
      logMode: 'none',
      rpcProvider: publicClient as any,
      web3Provider: walletClient as any,
      // viem client can be unavailable on ipfs+dev first renders
      rpcUrls: !publicClient && fallbackRpcUrl ? [fallbackRpcUrl] : undefined,
    });

    const steth = new LidoSDKstETH({ core });
    const wsteth = new LidoSDKwstETH({ core });

    return { core, steth, wsteth, subscribeToTokenUpdates: subscribe };
  }, [chainId, fallbackRpcUrl, publicClient, subscribe, walletClient]);
  return (
    <LidoSDKContext.Provider value={sdk}>{children}</LidoSDKContext.Provider>
  );
};
