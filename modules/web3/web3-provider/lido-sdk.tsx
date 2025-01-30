import { createContext, useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';
import { usePublicClient, useWalletClient } from 'wagmi';

import { LidoSDKStake } from '@lidofinance/lido-ethereum-sdk/stake';
import { CHAINS, LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';
import { LidoSDKWithdraw } from '@lidofinance/lido-ethereum-sdk/withdraw';
import { LidoSDKStatistics } from '@lidofinance/lido-ethereum-sdk/statistics';

import { useTokenTransferSubscription } from 'modules/web3/hooks/use-balance';
import { useDappChain } from './dapp-chain';

type LidoSDKContextValue = {
  chainId: CHAINS;
  core: LidoSDKCore;
  stake: LidoSDKStake;
  stETH: LidoSDKstETH;
  wstETH: LidoSDKwstETH;
  wrap: LidoSDKWrap;
  withdraw: LidoSDKWithdraw;
  statistics: LidoSDKStatistics;
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
    const withdraw = new LidoSDKWithdraw({ core });
    const statistics = new LidoSDKStatistics({ core });

    return {
      chainId: core.chainId,
      core,
      stake,
      stETH,
      wstETH,
      wrap,
      withdraw,
      statistics,
      subscribeToTokenUpdates: subscribe,
      // the L2 module you can to find in the 'modules/web3/web3-provider/lido-sdk-l2.tsx'
    };
  }, [chainId, publicClient, subscribe, walletClient]);
  return (
    <LidoSDKContext.Provider value={contextValue}>
      {children}
    </LidoSDKContext.Provider>
  );
};
