import { FC, PropsWithChildren, useMemo } from 'react';
import { ReefKnot, getConnectors, holesky } from 'reef-knot/core-react';
import { WagmiConfig, createClient, configureChains, Chain } from 'wagmi';
import * as wagmiChains from 'wagmi/chains';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';

import { useUserConfig } from 'config/user-config';
import { useGetRpcUrlByChainId } from 'config/rpc';
import { CHAINS } from 'consts/chains';
import { ConnectWalletModal } from 'shared/wallet/connect-wallet-modal';

import { SDKLegacyProvider } from './sdk-legacy';

const wagmiChainsArray = Object.values({ ...wagmiChains, holesky });

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
    return { supportedChains, defaultChain };
  }, [defaultChainId, supportedChainIds]);

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

  const client = useMemo(() => {
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
      autoConnect: false, // default wagmi autoConnect, MUST be false in our case, because we use custom autoConnect from Reef Knot
      provider,
      webSocketProvider,
    });
  }, [
    supportedChains,
    defaultChain,
    backendRPC,
    walletconnectProjectId,
    getRpcUrlByChainId,
  ]);

  return (
    <WagmiConfig client={client}>
      <ReefKnot
        autoConnect={isWalletConnectionAllowed}
        defaultChain={defaultChain}
        chains={supportedChains}
        rpc={backendRPC}
        walletconnectProjectId={walletconnectProjectId}
      >
        <SDKLegacyProvider
          defaultChainId={defaultChain.id}
          supportedChains={supportedChains}
          rpc={backendRPC}
        >
          {children}
          <ConnectWalletModal />
        </SDKLegacyProvider>
      </ReefKnot>
    </WagmiConfig>
  );
};

export default Web3Provider;
