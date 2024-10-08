import { createContext, useContext, useEffect, useMemo } from 'react';
import invariant from 'tiny-invariant';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from 'wagmi';

import { CHAINS, LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import { LidoSDKL2 } from '@lidofinance/lido-ethereum-sdk/l2';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';

import { config } from 'config';
import { useTokenTransferSubscription } from 'shared/hooks/use-balance';
import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';

type LidoSDKContextValue = {
  core: LidoSDKCore;
  stETH: LidoSDKstETH;
  wstETH: LidoSDKwstETH;
  l2: LidoSDKL2;
  wrap: LidoSDKWrap;
  isL2: boolean;
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
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });

  // reset internal wagmi state after disconnect
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  useEffect(() => {
    if (isConnected) {
      return () =>
        switchChain({
          chainId: config.defaultChain,
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

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
      isL2: !!LIDO_L2_CONTRACT_ADDRESSES[chainId as CHAINS],
      subscribeToTokenUpdates: subscribe,
    };
  }, [chainId, publicClient, subscribe, walletClient]);
  return (
    <LidoSDKContext.Provider value={contextValue}>
      {children}
    </LidoSDKContext.Provider>
  );
};
