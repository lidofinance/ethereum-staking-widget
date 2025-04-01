import { createContext, useContext, useEffect, useMemo } from 'react';
import invariant from 'tiny-invariant';
import {
  useAccount,
  useConfig,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from 'wagmi';

import { LidoSDKStake } from '@lidofinance/lido-ethereum-sdk/stake';
import { CHAINS, LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import {
  LidoSDKstETH,
  LidoSDKwstETH,
} from '@lidofinance/lido-ethereum-sdk/erc20';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';
import { LidoSDKWithdraw } from '@lidofinance/lido-ethereum-sdk/withdraw';
import { LidoSDKStatistics } from '@lidofinance/lido-ethereum-sdk/statistics';

// import { config, getContractsByLabel, CONTRACTS_SET_LABEL } from 'config';
import { config } from 'config';
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
  const { chainId: walletChain } = useAccount();
  const { chainId, isChainMatched, supportedChainIds } = useDappChain();

  // It is needed so that when the widget's chainId and the wallet's chainId do not match,
  // the wallet's chainId is passed to useWalletClient.
  // Otherwise, WalletConnect will switch the chainId in the Wagmi state.
  const sdkChainId = useMemo(() => {
    return isChainMatched
      ? chainId
      : walletChain && supportedChainIds.includes(walletChain)
        ? walletChain
        : config.defaultChain;
  }, [isChainMatched, chainId, walletChain, supportedChainIds]);
  const { data: walletClient } = useWalletClient({ chainId: sdkChainId });

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
      // customLidoLocatorAddress: getContractsByLabel(CONTRACTS_SET_LABEL).LIDO_LOCATOR,
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
