import { FC, PropsWithChildren, useMemo } from 'react';
import { ProviderWeb3 } from 'reef-knot/web3-react';
import { getConnectors } from 'reef-knot/core-react';
import { WagmiConfig, createClient, configureChains, Chain } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';

import { getStaticRpcBatchProvider } from '@lido-sdk/providers';

import { useCustomConfig } from 'providers/custom-config';
import { getBackendRPCPath, dynamics } from 'config';
import { useGetRpcUrl } from 'config/rpc';
import { CHAINS } from 'utils/chains';

const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  const { defaultChain, supportedChainIds, walletconnectProjectId } =
    useCustomConfig();
  const getRpcUrl = useGetRpcUrl();

  const backendRPC = useMemo(
    () =>
      supportedChainIds.reduce<Record<number, string>>(
        (res, curr) => ({ ...res, [curr]: getRpcUrl(curr) }),
        {
          // Required by reef-knot
          [CHAINS.Mainnet]: getRpcUrl(CHAINS.Mainnet),
        },
      ),
    [supportedChainIds, getRpcUrl],
  );

  const client = useMemo(() => {
    const wagmiChainsArray = Object.values(wagmiChains);
    const supportedChains = wagmiChainsArray.filter(
      (chain) =>
        dynamics.supportedChains.includes(chain.id) || chain.id === 80001,
    );
    const defaultChain = wagmiChainsArray.find(
      (chain) => chain.id === dynamics.defaultChain,
    );

    const jsonRcpBatchProvider = (chain: Chain) => ({
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
      [jsonRcpBatchProvider],
    );

    const connectors = getConnectors({
      chains,
      defaultChain,
      rpc: backendRPC,
      walletconnectProjectId,
    });

    return createClient({
      connectors,
      autoConnect: true,
      provider,
      webSocketProvider,
    });
    // TODO: check backendRPC here
  }, [backendRPC, walletconnectProjectId]);

  return (
    <WagmiConfig client={client}>
      {/* TODO */}
      {/* @ts-expect-error need to patch web3-react */}
      <ProviderWeb3
        pollingInterval={1200}
        defaultChainId={defaultChain}
        supportedChainIds={supportedChainIds}
        rpc={backendRPC}
        walletconnectProjectId={walletconnectProjectId}
      >
        {children}
      </ProviderWeb3>
    </WagmiConfig>
  );
};

export default Web3Provider;
