import { createContext, useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';
import { useChainId, usePublicClient, useWalletClient } from 'wagmi';

import { LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import { LidoSDKL2 } from '@lidofinance/lido-ethereum-sdk/l2';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';

import { useTokenTransferSubscription } from 'shared/hooks/use-balance';

type LidoSDKContextValue = {
  core: LidoSDKCore;
  stETH: LidoSDKstETH;
  wstETH: LidoSDKwstETH;
  l2: LidoSDKL2;
  wrap: LidoSDKWrap;
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
  const { data: walletClient } = useWalletClient();

  const contextValue = useMemo(() => {
    // @ts-expect-error: typing (viem + LidoSDK)
    const core = new LidoSDKCore({
      chainId,
      logMode: 'none',
      rpcProvider: publicClient,
      web3Provider: walletClient,
    });

    const stETH = new LidoSDKstETH({ core });
    const wstETH = new LidoSDKwstETH({ core });
    const wrap = new LidoSDKWrap({ core });
    const l2 = new LidoSDKL2({ core });

    return {
      core,
      stETH,
      wstETH,
      wrap,
      l2,
      subscribeToTokenUpdates: subscribe,
    };
  }, [chainId, publicClient, subscribe, walletClient]);
  return (
    <LidoSDKContext.Provider value={contextValue}>
      {children}
    </LidoSDKContext.Provider>
  );
};
