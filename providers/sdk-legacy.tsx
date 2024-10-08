import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useReefKnotContext } from 'reef-knot/core-react';
// TODO: to remove the 'reef-knot/web3-react' after it will be deprecated
import { useSupportedChains } from 'reef-knot/web3-react';
import { useAccount, useClient, useConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import { Web3Provider } from '@ethersproject/providers';
import { ProviderSDK } from '@lido-sdk/react';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';

import { SDK_LEGACY_SUPPORTED_CHAINS } from 'consts/chains';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

type SDKLegacyProviderProps = PropsWithChildren<{
  defaultChainId: number;
  pollingInterval: number;
}>;

export const SDKLegacyProvider = ({
  children,
  defaultChainId,
  pollingInterval,
}: SDKLegacyProviderProps) => {
  const { chainId: wagmiChainId = defaultChainId, address } = useAccount();
  const { supportedChains } = useSupportedChains();
  const { isDappActiveOnL1 } = useDappStatus();
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
      // old sdk can only supports wallet connection on L1
      if (!client || !address || !isDappActiveOnL1) return undefined;
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
  }, [
    config,
    config.state,
    client,
    address,
    isDappActiveOnL1,
    pollingInterval,
  ]);

  const supportedChainIds = useMemo(
    () => supportedChains.map((chain) => chain.chainId),
    [supportedChains],
  );

  const chainId = useMemo(() => {
    if (providerWeb3) {
      return supportedChainIds.indexOf(wagmiChainId) > -1 &&
        SDK_LEGACY_SUPPORTED_CHAINS.indexOf(wagmiChainId) > -1
        ? wagmiChainId
        : defaultChainId;
    }
    return defaultChainId;
  }, [defaultChainId, providerWeb3, supportedChainIds, wagmiChainId]);

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
      account={address ?? undefined}
    >
      {children}
    </ProviderSDK>
  );
};
