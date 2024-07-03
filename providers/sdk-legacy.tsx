import React, { PropsWithChildren, useMemo } from 'react';
import { useSupportedChains, useWeb3 } from 'reef-knot/web3-react';
import { useConnectorClient } from 'wagmi';

import { Web3Provider } from '@ethersproject/providers';
import { ProviderSDK } from '@lido-sdk/react';

import { mainnet } from 'wagmi/chains';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { useReefKnotContext } from 'reef-knot/core-react';

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
  const { chainId: web3ChainId = defaultChainId, account, active } = useWeb3();
  const { supportedChains } = useSupportedChains();
  const { data: client } = useConnectorClient();
  const { rpc } = useReefKnotContext();

  const providerWeb3 = useMemo(() => {
    if (!client || !client.account || !active) return;
    const { chain, transport } = client;

    // https://wagmi.sh/core/guides/ethers#reference-implementation-1
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new Web3Provider(transport, network);
    provider.pollingInterval = pollingInterval;

    return provider;
  }, [active, client, pollingInterval]);

  const supportedChainIds = useMemo(
    () => supportedChains.map((chain) => chain.chainId),
    [supportedChains],
  );

  const chainId =
    supportedChainIds.indexOf(web3ChainId) > -1 ? web3ChainId : defaultChainId;

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
