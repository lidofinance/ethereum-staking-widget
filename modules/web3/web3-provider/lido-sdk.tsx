import { createContext, useContext, useEffect, useMemo } from 'react';
import invariant from 'tiny-invariant';
import {
  useConnection,
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
import { LidoSDKDualGovernance } from '@lidofinance/lido-ethereum-sdk/dual-governance';

import { config } from 'config';
import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';
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
  dualGovernance: LidoSDKDualGovernance;
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
  const { isConnected } = useConnection();
  const { chainId, isChainMatched, wagmiWalletChain, supportedChainIds } =
    useDappChain();
  const walletChainId = wagmiWalletChain?.id;
  // It is needed so that when the widget's chainId and the wallet's chainId do not match,
  // the wallet's chainId is passed to useWalletClient.
  // Otherwise, WalletConnect will switch the chainId in the Wagmi state.
  const sdkChainId = useMemo(() => {
    return isChainMatched
      ? chainId
      : walletChainId && supportedChainIds.includes(walletChainId)
        ? walletChainId
        : config.defaultChain;
  }, [isChainMatched, chainId, walletChainId, supportedChainIds]);
  const { data: walletClient } = useWalletClient({ chainId: sdkChainId });

  const publicClient = usePublicClient({ chainId });

  // reset internal wagmi state after disconnect
  const wagmiConfig = useConfig();
  const { mutate: switchChain } = useSwitchChain();
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
      customLidoLocatorAddress: getContractAddress(
        chainId,
        CONTRACT_NAMES.lidoLocator,
      ),
    });

    const stake = new LidoSDKStake({ core });
    const stETH = new LidoSDKstETH({ core });
    const wstETH = new LidoSDKwstETH({ core });
    const wrap = new LidoSDKWrap({ core });
    const withdraw = new LidoSDKWithdraw({ core });
    const statistics = new LidoSDKStatistics({ core });
    const dualGovernance = new LidoSDKDualGovernance({ core });

    return {
      chainId: core.chainId,
      core,
      stake,
      stETH,
      wstETH,
      wrap,
      withdraw,
      statistics,
      dualGovernance,
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
