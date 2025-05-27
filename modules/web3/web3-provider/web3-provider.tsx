import {
  createContext,
  useContext,
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
} from 'react';
import invariant from 'tiny-invariant';
import { http, type PublicClient } from 'viem';
import {
  WagmiProvider,
  createConfig,
  useConnections,
  usePublicClient,
  fallback,
  type Config,
} from 'wagmi';
import * as wagmiChains from 'wagmi/chains';
import { Chain } from 'wagmi/chains';

import { ReefKnotProvider, getDefaultConfig } from 'reef-knot/core-react';
import {
  ReefKnotWalletsModal,
  getDefaultWalletsModalConfig,
} from 'reef-knot/connect-wallet-modal';
import { WalletIdsEthereum, WalletsListEthereum } from 'reef-knot/wallets';

import { useThemeToggle } from '@lidofinance/lido-ui';

import { config } from 'config';
import { CHAINS } from 'consts/chains';
import { useUserConfig } from 'config/user-config';
import { useGetRpcUrlByChainId } from 'config/rpc';
import { walletMetricProps } from 'consts/matomo';

import { SupportL1Chains } from './dapp-chain';
import { useWeb3Transport } from './use-web3-transport';
import { wagmiChainMap } from '../consts';

type ChainsList = [Chain, ...Chain[]];

const WALLETS_PINNED: WalletIdsEthereum[] = ['browserExtension'];

const WALLETS_SHOWN: WalletIdsEthereum[] = [
  'browserExtension',
  'metaMask',
  'okx',
  'ledgerHID',
  'ledgerLive',
  'walletConnect',
  'bitget',
  'imToken',
  'ambire',
  'safe',
  'dappBrowserInjected',
];

type Web3ProviderContextValue = {
  mainnetConfig: Config;
  publicClientMainnet: PublicClient;
};

const Web3ProviderContext = createContext<Web3ProviderContextValue | null>(
  null,
);
Web3ProviderContext.displayName = 'Web3ProviderContext';

export const useMainnetOnlyWagmi = () => {
  const value = useContext(Web3ProviderContext);
  invariant(value, 'useMainnetOnlyWagmi was used outside of Web3Provider');
  return value;
};

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
        {},
      ),
    [supportedChainIds, getRpcUrlByChainId],
  );
  const { transportMap, onActiveConnection } = useWeb3Transport(
    supportedChains,
    backendRPC,
  );

  const mainnetConfig = useMemo(() => {
    const batchConfig = {
      wait: config.PROVIDER_BATCH_TIME,
      batchSize: config.PROVIDER_MAX_BATCH,
    };

    const rpcUrlMainnet = getRpcUrlByChainId(CHAINS.Mainnet);

    return createConfig({
      chains: [wagmiChains.mainnet],
      ssr: true,
      connectors: [],
      batch: {
        multicall: false,
      },
      pollingInterval: config.PROVIDER_POLLING_INTERVAL,
      transports: {
        [wagmiChains.mainnet.id]: fallback([
          // api/rpc
          http(rpcUrlMainnet, {
            batch: batchConfig,
            name: rpcUrlMainnet,
          }),
          // fallback rpc from wagmi.chains like cloudfare-eth
          http(undefined, {
            batch: batchConfig,
            name: 'default public RPC URL',
          }),
        ]),
      },
    });
  }, [getRpcUrlByChainId]);

  const publicClientMainnet = usePublicClient({
    config: mainnetConfig,
  });

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
      ...walletMetricProps,
      walletsPinned: WALLETS_PINNED,
      walletsShown: WALLETS_SHOWN,
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
    <Web3ProviderContext.Provider
      value={{ mainnetConfig, publicClientMainnet }}
    >
      {/* default wagmi autoConnect, MUST be false in our case, because we use custom autoConnect from Reef Knot */}
      <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
        <ReefKnotProvider config={reefKnotConfig}>
          <ReefKnotWalletsModal
            config={walletsModalConfig}
            darkThemeEnabled={themeName === 'dark'}
          />
          <SupportL1Chains>{children}</SupportL1Chains>
        </ReefKnotProvider>
      </WagmiProvider>
    </Web3ProviderContext.Provider>
  );
};
