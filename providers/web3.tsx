import { FC, PropsWithChildren, useMemo } from 'react';
import { ProviderWeb3 } from 'reef-knot/web3-react';
import { getConnectors, holesky } from 'reef-knot/core-react';
import { WagmiConfig, createClient, configureChains, Chain } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';

import { CHAINS } from 'utils/chains';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';

import { useClientConfig } from 'providers/client-config';
import { dynamics, useGetRpcUrlByChainId } from 'config';
import { OrbyProvider } from '@orbykit/react';

const orbyConfig = {
  clientId: 'orblabs-internal-frontend',
  clientSecret: 'orblabs-internal-frontend',
};

const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  const { defaultChain, supportedChainIds, walletconnectProjectId } =
    useClientConfig();

  const getRpcUrlByChainId = useGetRpcUrlByChainId();

  const backendRPC = useMemo(
    () =>
      supportedChainIds.reduce<Record<number, string>>(
        (res, curr) => ({ ...res, [curr]: getRpcUrlByChainId(curr) }),
        {
          // Required by reef-knot
          [CHAINS.Mainnet]: getRpcUrlByChainId(CHAINS.Mainnet),
        },
      ),
    [supportedChainIds, getRpcUrlByChainId],
  );

  const client = useMemo(() => {
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

    const defaultChain =
      wagmiChainsArray.find((chain) => chain.id === dynamics.defaultChain) ||
      supportedChains[0]; // first supported chain as fallback

    const jsonRpcBatchProvider = (chain: Chain) => ({
      provider: () =>
        getStaticRpcBatchProvider(
          chain.id,
          getRpcUrlByChainId(chain.id),
          undefined,
          12000,
        ),
      chain: {
        ...chain,
        rpcUrls: {
          ...chain.rpcUrls,
          public: { http: [getRpcUrlByChainId(chain.id)] },
          default: { http: [getRpcUrlByChainId(chain.id)] },
        },
      },
    });

    const { chains, provider, webSocketProvider } = configureChains(
      supportedChains,
      [jsonRpcBatchProvider],
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
      <ProviderWeb3
        pollingInterval={1200}
        defaultChainId={defaultChain}
        supportedChainIds={supportedChainIds}
        rpc={backendRPC}
        walletconnectProjectId={walletconnectProjectId}
      >
        <OrbyProvider.withReefKnot config={orbyConfig}>
          {children}
        </OrbyProvider.withReefKnot>
      </ProviderWeb3>
    </WagmiConfig>
  );
};

export default Web3Provider;
