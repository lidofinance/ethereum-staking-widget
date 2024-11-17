import { FC, PropsWithChildren, useEffect, useMemo } from 'react';
import { WagmiProvider, createConfig, useConnections } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';
import {
  AutoConnect,
  ReefKnot,
  getWalletsDataList,
} from 'reef-knot/core-react';
import { WalletsListEthereum } from 'reef-knot/wallets';

import { config } from 'config';
import { useUserConfig } from 'config/user-config';
import { useGetRpcUrlByChainId } from 'config/rpc';
import { CHAINS } from 'consts/chains';
import { ConnectWalletModal } from './connect-wallet-modal';

import { useWeb3Transport } from './use-web3-transport';
import { LidoSDKProvider } from './lido-sdk';
import { SDKLegacyProvider } from './sdk-legacy';
import { SupportL1Chains } from './dapp-chain';

type ChainsList = [wagmiChains.Chain, ...wagmiChains.Chain[]];

export const wagmiChainMap = Object.values(wagmiChains).reduce(
  (acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  },
  {} as Record<number, wagmiChains.Chain>,
);

export const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  const {
    defaultChain: defaultChainId,
    supportedChainIds,
    walletconnectProjectId,
    isWalletConnectionAllowed,
  } = useUserConfig();

  const { supportedChains, defaultChain } = useMemo(() => {
    // must preserve order of supportedChainIds
    const supportedChains = supportedChainIds
      .map((id) => wagmiChainMap[id])
      .filter((chain) => chain) as ChainsList;

    const defaultChain = wagmiChainMap[defaultChainId] || supportedChains[0];
    return {
      supportedChains,
      defaultChain,
    };
  }, [defaultChainId, supportedChainIds]);

  const getRpcUrlByChainId = useGetRpcUrlByChainId();

  const backendRPC: Record<number, string> = useMemo(
    () =>
      supportedChainIds.reduce(
        (res, curr) => ({ ...res, [curr]: getRpcUrlByChainId(curr) }),
        {
          // Mainnet RPC is always required for some requests, e.g. ETH to USD price, ENS lookup
          [CHAINS.Mainnet]: getRpcUrlByChainId(CHAINS.Mainnet),
        },
      ),
    [supportedChainIds, getRpcUrlByChainId],
  );

  const { walletsDataList } = useMemo(() => {
    return getWalletsDataList({
      walletsList: WalletsListEthereum,
      rpc: backendRPC,
      walletconnectProjectId,
      defaultChain,
    });
  }, [backendRPC, defaultChain, walletconnectProjectId]);

  const { transportMap, onActiveConnection } = useWeb3Transport(
    supportedChains,
    backendRPC,
  );

  const wagmiConfig = useMemo(() => {
    return createConfig({
      chains: supportedChains,
      ssr: true,
      connectors: [],
      batch: {
        multicall: false,
      },
      multiInjectedProviderDiscovery: false,
      pollingInterval: config.PROVIDER_POLLING_INTERVAL,
      transports: transportMap,
    });
  }, [supportedChains, transportMap]);

  const [activeConnection] = useConnections({ config: wagmiConfig });

  useEffect(() => {
    void onActiveConnection(activeConnection ?? null);
  }, [activeConnection, onActiveConnection]);

  return (
    // default wagmi autoConnect, MUST be false in our case, because we use custom autoConnect from Reef Knot
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <ReefKnot
        rpc={backendRPC}
        chains={supportedChains}
        walletDataList={walletsDataList}
      >
        {isWalletConnectionAllowed && <AutoConnect autoConnect />}
        <LidoSDKProvider>
          <SupportL1Chains>
            <SDKLegacyProvider>{children}</SDKLegacyProvider>
          </SupportL1Chains>
        </LidoSDKProvider>
        <ConnectWalletModal />
      </ReefKnot>
    </WagmiProvider>
  );
};
