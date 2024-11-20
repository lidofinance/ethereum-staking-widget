import { createContext, useContext, useEffect, useMemo } from 'react';
import invariant from 'tiny-invariant';
import {
  useAccount,
  useConfig,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from 'wagmi';

import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';
import { LidoSDKStake } from '@lidofinance/lido-ethereum-sdk/stake';
import { CHAINS, LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import { LidoSDKShares } from '@lidofinance/lido-ethereum-sdk/shares';
import { LidoSDKL2 } from '@lidofinance/lido-ethereum-sdk/l2';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';
import { LidoSDKWithdraw } from '@lidofinance/lido-ethereum-sdk/withdraw';

import { config } from 'config';
import { useTokenTransferSubscription } from 'modules/web3/hooks/use-balance';
import { useDappChain } from './dapp-chain';

type LidoSDKContextValue = {
  core: LidoSDKCore;
  stake: LidoSDKStake;
  stETH: LidoSDKstETH;
  wstETH: LidoSDKwstETH;
  l2: LidoSDKL2;
  wrap: LidoSDKWrap;
  shares: LidoSDKShares;
  withdraw: LidoSDKWithdraw;
  chainId: CHAINS;
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

  // will only have
  const { chainId } = useDappChain();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  // reset internal wagmi state after disconnect
  const { isConnected } = useAccount();

  const wagmiConfig = useConfig();
  const { switchChain } = useSwitchChain();
  useEffect(() => {
    if (isConnected) {
      return () => {
        // protecs from side effect double run
        if (!wagmiConfig.state.current) {
          switchChain({
            chainId: config.defaultChain,
          });
        }
      };
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

    const stake = new LidoSDKStake({ core });
    const stETH = new LidoSDKstETH({ core });
    const wstETH = new LidoSDKwstETH({ core });
    const wrap = new LidoSDKWrap({ core });
    const shares = new LidoSDKShares({ core });
    const withdraw = new LidoSDKWithdraw({ core });
    const l2 = new LidoSDKL2({ core });

    return {
      core,
      stake,
      stETH,
      wstETH,
      wrap,
      shares,
      withdraw,
      l2,
      chainId: core.chainId,
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
