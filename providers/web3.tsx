import { FC, PropsWithChildren, useMemo } from 'react';

import {
  createConfig,
  WagmiProvider,
  http,
  deserialize,
  serialize,
} from 'wagmi';
import { mainnet, holesky } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import {
  AutoConnect,
  getWalletsDataList,
  ReefKnot,
} from 'reef-knot/core-react';
import { WalletsListEthereum } from 'reef-knot/wallets';

import { useUserConfig } from 'config/user-config';
import { useGetRpcUrlByChainId, getBackendRPCPath } from 'config/rpc';
import { CHAINS } from 'consts/chains';
import { ConnectWalletModal } from 'shared/wallet/connect-wallet-modal';

import { SDKLegacyProvider } from './sdk-legacy';

const supportedChains = [holesky, mainnet] as const;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1_000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const persister = createSyncStoragePersister({
  serialize,
  storage: global.localStorage,
  deserialize,
});

const config = createConfig({
  chains: supportedChains,
  multiInjectedProviderDiscovery: false,
  ssr: true,
  transports: {
    [holesky.id]: http(),
    [mainnet.id]: http(),
  },
});

const { walletsDataList } = getWalletsDataList({
  walletsList: WalletsListEthereum,
  rpc: { [holesky.id]: getBackendRPCPath(holesky.id) },
  walletconnectProjectId: '',
  defaultChain: holesky,
});

const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  const {
    defaultChain: defaultChainId,
    supportedChainIds,
    isWalletConnectionAllowed,
  } = useUserConfig();

  const { defaultChain } = useMemo(() => {
    const defaultChain =
      supportedChains.find((chain) => chain.id === defaultChainId) ||
      supportedChains[0]; // first supported chain as fallback
    return { defaultChain };
  }, [defaultChainId]);

  const getRpcUrlByChainId = useGetRpcUrlByChainId();

  const backendRPC = useMemo(
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

  // const client = useMemo(() => {
  //   const jsonRpcBatchProvider = (chain) => ({
  //     provider: () =>
  //       getStaticRpcBatchProvider(
  //         chain.id,
  //         getRpcUrlByChainId(chain.id),
  //         undefined,
  //         12000,
  //       ).on('debug', onRpcProviderError),
  //     chain: {
  //       ...chain,
  //       rpcUrls: {
  //         ...chain.rpcUrls,
  //         public: { http: [getRpcUrlByChainId(chain.id)] },
  //         default: { http: [getRpcUrlByChainId(chain.id)] },
  //       },
  //     },
  //   });
  //
  //   const { chains, provider, webSocketProvider } = configureChains(
  //     supportedChains,
  //     [jsonRpcBatchProvider],
  //   );
  //
  //   const connectors = getConnectors({
  //     chains,
  //     defaultChain,
  //     rpc: backendRPC,
  //     walletconnectProjectId,
  //   });
  //
  //   return createClient({
  //     connectors,
  //     autoConnect: false, // default wagmi autoConnect, MUST be false in our case, because we use custom autoConnect from Reef Knot
  //     provider,
  //     webSocketProvider,
  //   });
  // }, [
  //   supportedChains,
  //   defaultChain,
  //   backendRPC,
  //   walletconnectProjectId,
  //   getRpcUrlByChainId,
  // ]);

  // eslint-disable-next-line
  console.log('web3 provider render with config', { ...config });

  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <ReefKnot
          chains={supportedChains}
          rpc={backendRPC}
          walletDataList={walletsDataList}
        >
          <AutoConnect autoConnect={isWalletConnectionAllowed} />
          <SDKLegacyProvider
            defaultChainId={defaultChain.id}
            supportedChains={supportedChains}
            rpc={backendRPC}
          >
            {children}
            <ConnectWalletModal />
          </SDKLegacyProvider>
        </ReefKnot>
      </PersistQueryClientProvider>
    </WagmiProvider>
  );
};

export default Web3Provider;
