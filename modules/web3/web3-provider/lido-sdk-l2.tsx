import { createContext, useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';
import { useConnection, usePublicClient, useWalletClient } from 'wagmi';

import { LIDO_L2_CONTRACT_ADDRESSES } from '@lidofinance/lido-ethereum-sdk/common';
import { CHAINS, LidoSDKCore } from '@lidofinance/lido-ethereum-sdk/core';
import { LidoSDKL2 } from '@lidofinance/lido-ethereum-sdk/l2';

import { config } from 'config';
import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';

import { useDappChain } from './dapp-chain';

type LidoSDKL2ContextValue = {
  chainId: CHAINS;
  core: LidoSDKCore;
  l2: LidoSDKL2;
  isL2: boolean;
};

const LidoSDKL2Context = createContext<LidoSDKL2ContextValue | null>(null);
LidoSDKL2Context.displayName = 'LidoSDKL2Context';

export const useLidoSDKL2 = () => {
  const value = useContext(LidoSDKL2Context);
  invariant(value, 'useLidoSDKL2 was used outside of LidoSDKL2Provider');
  return value;
};

export const LidoSDKL2Provider = ({ children }: React.PropsWithChildren) => {
  const { chainId: walletChain } = useConnection();
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
  const publicClient = usePublicClient({ chainId: sdkChainId });

  const contextValue = useMemo(() => {
    // @ts-expect-error: typing (viem + LidoSDK)
    const core = new LidoSDKCore({
      chainId: sdkChainId,
      logMode: 'none',
      publicClient,
      walletClient,
      customLidoLocatorAddress: getContractAddress(
        sdkChainId,
        CONTRACT_NAMES.lidoLocator,
      ),
    });

    return {
      chainId: core.chainId,
      core,
      l2: new LidoSDKL2({ core }),
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- rule false positive: number is not a valid index for the CHAINS-keyed map without the assertion
      isL2: !!LIDO_L2_CONTRACT_ADDRESSES[sdkChainId as CHAINS],
    };
  }, [publicClient, sdkChainId, walletClient]);
  return (
    <LidoSDKL2Context.Provider value={contextValue}>
      {children}
    </LidoSDKL2Context.Provider>
  );
};
