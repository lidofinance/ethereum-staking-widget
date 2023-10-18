import { FC, PropsWithChildren, useMemo } from 'react';
import { ProviderWeb3 } from 'reef-knot/web3-react';
import { getConnectors, holesky } from 'reef-knot/core-react';
import { WagmiConfig, createClient, configureChains, Chain } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';

import { CHAINS } from 'utils/chains';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';

import { useCustomConfig } from 'providers/custom-config';
import { dynamics, useRpcUrlByChainIdGetter } from 'config';

const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  const { defaultChain, supportedChainIds, walletconnectProjectId } =
    useCustomConfig();

  const getRpcUrlByChainId = useRpcUrlByChainIdGetter();

  const backendRPC = useMemo(
    () =>
      supportedChainIds.reduce<Record<number, string>>(
        // TODO
        (res, curr) => ({ ...res, [curr]: getRpcUrlByChainId(curr) ?? '' }),
        {
          // TODO
          // Required by reef-knot
          [CHAINS.Mainnet]: getRpcUrlByChainId(CHAINS.Mainnet) ?? '',
        },
      ),
    [supportedChainIds, getRpcUrlByChainId],
  );

  const client = useMemo(() => {
    const wagmiChainsArray = Object.values({ ...wagmiChains, holesky });
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
          // TODO
          getRpcUrlByChainId(chain.id) ?? '',
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
  }, [backendRPC, getRpcUrlByChainId, walletconnectProjectId]);

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
