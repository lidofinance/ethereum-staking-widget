import { FC } from 'react';
import { ProviderWeb3 } from 'reef-knot/web3-react';
import { getConnectors } from 'reef-knot/core-react';
import { backendRPC, getBackendRPCPath, dynamics } from 'config';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const supportedChains = Object.values(wagmiChains).filter((chain) =>
  dynamics.supportedChains.includes(chain.id),
);

const connectors = getConnectors({
  rpc: backendRPC,
});

const { provider, webSocketProvider } = configureChains(supportedChains, [
  jsonRpcProvider({
    rpc: (chain) => ({
      http: getBackendRPCPath(chain.id),
    }),
  }),
]);

const client = createClient({
  connectors,
  autoConnect: true,
  provider,
  webSocketProvider,
});

const Web3Provider: FC = ({ children }) => (
  <WagmiConfig client={client}>
    <ProviderWeb3
      defaultChainId={dynamics.defaultChain}
      supportedChainIds={dynamics.supportedChains}
      rpc={backendRPC}
    >
      {children}
    </ProviderWeb3>
  </WagmiConfig>
);

export default Web3Provider;
