import React, { useEffect, useState } from 'react';
import { ProviderSDK } from '@lido-sdk/react';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { Web3Provider } from '@ethersproject/providers';
import { Chain, useAccount } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { useWeb3 } from 'reef-knot/web3-react';

const POLLING_INTERVAL = 12_000;

export const SDKLegacyProvider = (props: {
  children?: React.ReactNode;
  defaultChainId: number;
  supportedChains: Chain[];
  rpc: Record<number, string>;
  pollingInterval?: number;
}) => {
  const {
    children,
    defaultChainId,
    rpc,
    supportedChains,
    pollingInterval = POLLING_INTERVAL,
  } = props;
  const { chainId = defaultChainId, account } = useWeb3();
  const { connector, isConnected } = useAccount();

  const [providerWeb3, setProviderWeb3] = useState<Web3Provider>();

  // Reset web3 provider if the provider was set previously,
  // and currently no wallet is connected.
  // Gets triggered on a wallet disconnection, for example.
  if (!isConnected && providerWeb3) {
    setProviderWeb3(undefined);
  }

  useEffect(() => {
    void (async () => {
      if (!providerWeb3 && connector && isConnected) {
        const provider = await connector.getProvider();
        // `any` param + page reload on network change
        // are described here: https://github.com/ethers-io/ethers.js/issues/866
        // this approach is needed to fix a NETWORK_ERROR after chain changing
        const wrappedProvider = new Web3Provider(provider, 'any');
        wrappedProvider.on('network', (newNetwork, oldNetwork) => {
          // When a Provider makes its initial connection, it emits a "network"
          // event with a null oldNetwork along with the newNetwork. So, if the
          // oldNetwork exists, it represents a changing network
          if (oldNetwork) {
            window.location.reload();
          }
        });
        wrappedProvider.pollingInterval = pollingInterval;
        setProviderWeb3(wrappedProvider);
      }
    })();
  }, [connector, isConnected, pollingInterval, providerWeb3]);

  const supportedChainIds = supportedChains.map((chain) => chain.id);

  const providerRpc = getStaticRpcBatchProvider(
    chainId,
    rpc[chainId],
    0,
    pollingInterval,
  );

  const providerMainnetRpc = getStaticRpcBatchProvider(
    mainnet.id,
    rpc[mainnet.id],
    0,
    pollingInterval,
  );

  return (
    // @ts-expect-error Property children does not exist on type
    <ProviderSDK
      chainId={chainId}
      supportedChainIds={supportedChainIds}
      providerWeb3={providerWeb3}
      providerRpc={providerRpc}
      providerMainnetRpc={providerMainnetRpc}
      account={account ?? undefined}
    >
      {children}
    </ProviderSDK>
  );
};
