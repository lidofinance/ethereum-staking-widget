import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useReefKnotContext } from 'reef-knot/core-react';
import { useSupportedChains } from 'reef-knot/web3-react';
import { useAccount, useClient, useConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import { Web3Provider } from '@ethersproject/providers';
import { ProviderSDK } from '@lido-sdk/react';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';

import { useDappStatus } from 'shared/hooks/use-dapp-status';

const POLLING_INTERVAL = 12_000;

type SDKLegacyProviderProps = PropsWithChildren<{
  defaultChainId: number;
  pollingInterval?: number;
}>;

export const SDKLegacyProvider = ({
  children,
  defaultChainId,
  pollingInterval = POLLING_INTERVAL,
}: SDKLegacyProviderProps) => {
  const { chainId: wagmiChainId = defaultChainId, address } = useAccount();
  const { supportedChains } = useSupportedChains();
  const { isDappActive } = useDappStatus();
  const config = useConfig();
  const client = useClient();
  const { rpc } = useReefKnotContext();

  const [providerWeb3, setProviderWeb3] = useState<Web3Provider | undefined>();

  useEffect(() => {
    let isHookMounted = true;

    const getProviderTransport = async () => {
      const { state } = config;
      if (!state.current) return client?.transport;
      const connector = state.connections.get(state.current)?.connector;
      if (!connector) return client?.transport;
      const provider: any = await connector.getProvider();
      return provider || client?.transport;
    };

    const getProviderValue = async () => {
      if (!client || !address || !isDappActive) return undefined;
      const { chain } = client;
      const providerTransport = await getProviderTransport();

      // https://wagmi.sh/core/guides/ethers#reference-implementation-1
      const provider = new Web3Provider(providerTransport, {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
      });
      provider.pollingInterval = pollingInterval;

      return provider;
    };

    const getProviderAndSet = async () => {
      const provider = await getProviderValue();
      if (isHookMounted) setProviderWeb3(provider);
    };

    void getProviderAndSet();

    return () => {
      isHookMounted = false;
    };
  }, [config, config.state, client, address, isDappActive, pollingInterval]);

  const supportedChainIds = useMemo(
    () => supportedChains.map((chain) => chain.chainId),
    [supportedChains],
  );

  const chainId = useMemo(() => {
    return supportedChainIds.indexOf(wagmiChainId) > -1
      ? wagmiChainId
      : defaultChainId;
  }, [defaultChainId, supportedChainIds, wagmiChainId]);

  const providerRpc = useMemo(
    () => getStaticRpcBatchProvider(chainId, rpc[chainId], 0, POLLING_INTERVAL),
    [rpc, chainId],
  );

  const providerMainnetRpc = useMemo(
    () =>
      getStaticRpcBatchProvider(
        mainnet.id,
        rpc[mainnet.id],
        0,
        POLLING_INTERVAL,
      ),
    [rpc],
  );

  return (
    // @ts-expect-error Property children does not exist on type
    <ProviderSDK
      chainId={chainId}
      supportedChainIds={supportedChainIds}
      providerWeb3={providerWeb3}
      providerRpc={providerRpc}
      providerMainnetRpc={providerMainnetRpc}
      account={address ?? undefined}
    >
      {children}
    </ProviderSDK>
  );
};
