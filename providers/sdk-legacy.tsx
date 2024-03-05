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
}) => {
  const { children, defaultChainId, rpc, supportedChains } = props;
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
        const wrappedProvider = new Web3Provider(provider);
        wrappedProvider.pollingInterval = POLLING_INTERVAL;
        setProviderWeb3(wrappedProvider);
      }
    })();
  }, [connector, isConnected, providerWeb3]);

  const supportedChainIds = supportedChains.map((chain) => chain.id);

  const providerRpc = getStaticRpcBatchProvider(
    chainId,
    rpc[chainId],
    0,
    POLLING_INTERVAL,
  );

  const providerMainnetRpc = getStaticRpcBatchProvider(
    mainnet.id,
    rpc[mainnet.id],
    0,
    POLLING_INTERVAL,
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
