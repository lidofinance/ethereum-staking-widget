import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useSupportedChains, useWeb3 } from 'reef-knot/web3-react';
import { useClient, useConfig } from 'wagmi';

import { Web3Provider } from '@ethersproject/providers';
import { ProviderSDK } from '@lido-sdk/react';

import { mainnet } from 'wagmi/chains';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { useReefKnotContext } from 'reef-knot/core-react';

type SDKLegacyProviderProps = PropsWithChildren<{
  defaultChainId: number;
  pollingInterval: number;
}>;

export const SDKLegacyProvider = ({
  children,
  defaultChainId,
  pollingInterval,
}: SDKLegacyProviderProps) => {
  const { chainId: web3ChainId = defaultChainId, account, active } = useWeb3();
  const { supportedChains } = useSupportedChains();
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
      if (!client || !account || !active) return undefined;
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
  }, [config, config.state, client, account, active, pollingInterval]);

  const supportedChainIds = useMemo(
    () => supportedChains.map((chain) => chain.chainId),
    [supportedChains],
  );

  const chainId = useMemo(() => {
    return supportedChainIds.indexOf(web3ChainId) > -1
      ? web3ChainId
      : defaultChainId;
  }, [defaultChainId, supportedChainIds, web3ChainId]);

  const providerRpc = useMemo(
    () => getStaticRpcBatchProvider(chainId, rpc[chainId], 0, pollingInterval),
    [rpc, chainId, pollingInterval],
  );

  const providerMainnetRpc = useMemo(
    () =>
      getStaticRpcBatchProvider(
        mainnet.id,
        rpc[mainnet.id],
        0,
        pollingInterval,
      ),
    [rpc, pollingInterval],
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
