import { FC } from 'react';
import { ProviderWeb3 } from 'reef-knot/web3-react';
import { backendRPC, getBackendRPCPath, dynamics } from 'config';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { mainnet, goerli } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const { provider, webSocketProvider } = configureChains(
  [mainnet, goerli],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: getBackendRPCPath(chain.id),
      }),
    }),
  ],
);

const client = createClient({
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
