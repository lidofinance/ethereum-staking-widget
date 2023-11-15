import { FC, PropsWithChildren } from 'react';
import { ProviderWeb3 } from 'reef-knot/web3-react';
import { getConnectors, holesky } from 'reef-knot/core-react';
import { backendRPC, getBackendRPCPath, dynamics } from 'config';
import { WagmiConfig, createClient, configureChains, Chain } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';

const wagmiChainsArray = Object.values({ ...wagmiChains, holesky });
const supportedChains = wagmiChainsArray.filter((chain) =>
  dynamics.supportedChains.includes(chain.id),
);

// Adding Mumbai as a temporary workaround
// for the wagmi and walletconnect bug, when some wallets are failing to connect
// when there are only one supported network, so we need at least 2 of them.
// Mumbai should be the last in the array, otherwise wagmi can send request to it.
// TODO: remove after updating wagmi to v1+
supportedChains.push(wagmiChains.polygonMumbai);

const defaultChain = wagmiChainsArray.find(
  (chain) => chain.id === dynamics.defaultChain,
);

const jsonRpcBatchProvider = (chain: Chain) => ({
  provider: () =>
    getStaticRpcBatchProvider(
      chain.id,
      getBackendRPCPath(chain.id),
      undefined,
      12000,
    ),
  chain,
});

const { chains, provider, webSocketProvider } = configureChains(
  supportedChains,
  [jsonRpcBatchProvider],
);

const connectors = getConnectors({
  chains,
  defaultChain,
  rpc: backendRPC,
  walletconnectProjectId: dynamics.walletconnectProjectId,
});

const client = createClient({
  connectors,
  autoConnect: true,
  provider,
  webSocketProvider,
});

const Web3Provider: FC<PropsWithChildren> = ({ children }) => (
  <WagmiConfig client={client}>
    {/* TODO */}
    {/* @ts-expect-error need to patch web3-react */}
    <ProviderWeb3
      pollingInterval={1200}
      defaultChainId={dynamics.defaultChain}
      supportedChainIds={dynamics.supportedChains}
      rpc={backendRPC}
      walletconnectProjectId={dynamics.walletconnectProjectId}
    >
      {children}
    </ProviderWeb3>
  </WagmiConfig>
);

export default Web3Provider;
