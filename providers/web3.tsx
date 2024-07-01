import { FC, PropsWithChildren, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, WagmiProvider, createConfig } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';
import {
  AutoConnect,
  ReefKnot,
  getWalletsDataList,
} from 'reef-knot/core-react';
import { WalletsListEthereum } from 'reef-knot/wallets';

import { useUserConfig } from 'config/user-config';
import { useGetRpcUrlByChainId } from 'config/rpc';
import { CHAINS } from 'consts/chains';
import { ConnectWalletModal } from 'shared/wallet/connect-wallet-modal';

import { SDKLegacyProvider } from './sdk-legacy';

type ChainsList = [wagmiChains.Chain, ...wagmiChains.Chain[]];

const wagmiChainsArray = Object.values(wagmiChains) as any as ChainsList;

const queryClient = new QueryClient();

const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  const {
    defaultChain: defaultChainId,
    supportedChainIds,
    walletconnectProjectId,
    isWalletConnectionAllowed,
  } = useUserConfig();

  const { supportedChains, defaultChain } = useMemo(() => {
    const supportedChains = wagmiChainsArray.filter((chain) =>
      supportedChainIds.includes(chain.id),
    );

    // Adding Mumbai as a temporary workaround
    // for the wagmi and walletconnect bug, when some wallets are failing to connect
    // when there are only one supported network, so we need at least 2 of them.
    // Mumbai should be the last in the array, otherwise wagmi can send request to it.
    // TODO: remove after updating wagmi to v1+
    supportedChains.push(wagmiChains.polygonMumbai);

    const defaultChain =
      supportedChains.find((chain) => chain.id === defaultChainId) ||
      supportedChains[0]; // first supported chain as fallback
    return {
      supportedChains: supportedChains as ChainsList,
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
      walletconnectProjectId: walletconnectProjectId,
      defaultChain: defaultChain,
    });
  }, [backendRPC, defaultChain, walletconnectProjectId]);

  const config = useMemo(() => {
    return createConfig({
      chains: supportedChains,
      ssr: true,
      multiInjectedProviderDiscovery: false,
      transports: supportedChains.reduce((res, curr) => ({
        ...res,
        [curr.id]: http(backendRPC[curr.id], { batch: true }),
      })),
    });
  }, [supportedChains, backendRPC]);

  return (
    // default wagmi autoConnect, MUST be false in our case, because we use custom autoConnect from Reef Knot
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <ReefKnot
          rpc={backendRPC}
          chains={supportedChains}
          walletDataList={walletsDataList}
        >
          {isWalletConnectionAllowed && <AutoConnect autoConnect />}
          <SDKLegacyProvider defaultChainId={defaultChain.id}>
            {children}
            <ConnectWalletModal />
          </SDKLegacyProvider>
        </ReefKnot>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Web3Provider;
