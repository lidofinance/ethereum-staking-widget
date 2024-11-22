import { FC, PropsWithChildren, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useConnections } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';
import { ReefKnotProvider, getDefaultConfig } from 'reef-knot/core-react';
import {
  ReefKnotWalletsModal,
  getDefaultWalletsModalConfig,
} from 'reef-knot/connect-wallet-modal';
import { WalletIdsEthereum, WalletsListEthereum } from 'reef-knot/wallets';
import { useThemeToggle } from '@lidofinance/lido-ui';

import { config } from 'config';
import { useUserConfig } from 'config/user-config';
import { useGetRpcUrlByChainId } from 'config/rpc';
import { CHAINS } from 'consts/chains';
import { walletsMetrics } from 'consts/matomo-wallets-events';

import { useWeb3Transport } from './use-web3-transport';
import { LidoSDKProvider } from './lido-sdk';
import { SDKLegacyProvider } from './sdk-legacy';
import { SupportL1Chains } from './dapp-chain';

type ChainsList = [wagmiChains.Chain, ...wagmiChains.Chain[]];

const WALLETS_PINNED: WalletIdsEthereum[] = [
  'binanceWallet',
  'browserExtension',
];

export const wagmiChainMap = Object.values(wagmiChains).reduce(
  (acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  },
  {} as Record<number, wagmiChains.Chain>,
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  const {
    defaultChain: defaultChainId,
    supportedChainIds,
    walletconnectProjectId,
    isWalletConnectionAllowed,
  } = useUserConfig();
  const { themeName } = useThemeToggle();

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
  const { transportMap, onActiveConnection } = useWeb3Transport(
    supportedChains,
    backendRPC,
  );

  const { wagmiConfig, reefKnotConfig, walletsModalConfig } = useMemo(() => {
    return getDefaultConfig({
      // Reef-Knot config args
      rpc: backendRPC,
      defaultChain: defaultChain,
      walletconnectProjectId,
      walletsList: WalletsListEthereum,

      // Wagmi config args
      transports: transportMap,
      chains: supportedChains,
      autoConnect: isWalletConnectionAllowed,
      ssr: true,
      pollingInterval: config.PROVIDER_POLLING_INTERVAL,
      batch: {
        multicall: false,
      },

      // Wallets config args
      ...getDefaultWalletsModalConfig(),
      metrics: walletsMetrics,
      walletsPinned: WALLETS_PINNED,
    });
  }, [
    backendRPC,
    supportedChains,
    defaultChain,
    walletconnectProjectId,
    isWalletConnectionAllowed,
    transportMap,
  ]);

  const [activeConnection] = useConnections({ config: wagmiConfig });

  useEffect(() => {
    void onActiveConnection(activeConnection ?? null);
  }, [activeConnection, onActiveConnection]);

  return (
    // default wagmi autoConnect, MUST be false in our case, because we use custom autoConnect from Reef Knot
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <ReefKnotProvider config={reefKnotConfig}>
          <ReefKnotWalletsModal
            config={walletsModalConfig}
            darkThemeEnabled={themeName === 'dark'}
          />
          <LidoSDKProvider>
            <SupportL1Chains>
              <SDKLegacyProvider>{children}</SDKLegacyProvider>
            </SupportL1Chains>
          </LidoSDKProvider>
        </ReefKnotProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
