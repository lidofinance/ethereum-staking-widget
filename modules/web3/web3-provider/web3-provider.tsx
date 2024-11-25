import {
  createContext,
  useContext,
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
} from 'react';
import invariant from 'tiny-invariant';
import {
  WagmiProvider,
  createConfig,
  useConnections,
  fallback,
  type Config,
} from 'wagmi';
import * as wagmiChains from 'wagmi/chains';
import { http } from 'viem';
import {
  AutoConnect,
  ReefKnot,
  getWalletsDataList,
} from 'reef-knot/core-react';
import { WalletsListEthereum } from 'reef-knot/wallets';

import { config } from 'config';
import { CHAINS } from 'consts/chains';
import { useUserConfig } from 'config/user-config';
import { useGetRpcUrlByChainId } from 'config/rpc';

import { ConnectWalletModal } from './connect-wallet-modal';
import { SupportL1Chains } from './dapp-chain';
import { useWeb3Transport } from './use-web3-transport';

type ChainsList = [wagmiChains.Chain, ...wagmiChains.Chain[]];

export const wagmiChainMap = Object.values(wagmiChains).reduce(
  (acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  },
  {} as Record<number, wagmiChains.Chain>,
);

type Web3ProviderContextValue = {
  wagmiMainnetOnlyConfig: Config;
};

const Web3ProviderContext = createContext<Web3ProviderContextValue | null>(
  null,
);
Web3ProviderContext.displayName = 'Web3ProviderContext';

export const useWagmiMainnetOnlyConfig = () => {
  const value = useContext(Web3ProviderContext);
  invariant(
    value,
    'useWagmiMainnetOnlyConfig was used outside of Web3Provider',
  );
  return value.wagmiMainnetOnlyConfig;
};

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
        {},
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

  const wagmiMainnetOnlyConfig = useMemo(() => {
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
    <Web3ProviderContext.Provider value={{ wagmiMainnetOnlyConfig }}>
      {/* default wagmi autoConnect, MUST be false in our case, because we use custom autoConnect from Reef Knot */}
      <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
        <ReefKnot
          rpc={backendRPC}
          chains={supportedChains}
          walletDataList={walletsDataList}
        >
          {isWalletConnectionAllowed && <AutoConnect autoConnect />}
          <SupportL1Chains>{children}</SupportL1Chains>
          <ConnectWalletModal />
        </ReefKnot>
      </WagmiProvider>
    </Web3ProviderContext.Provider>
  );
};
