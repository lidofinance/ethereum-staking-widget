import React, { PropsWithChildren, useMemo } from 'react';
import { useAccount, usePublicClient } from 'wagmi';

import { Web3Provider } from '@ethersproject/providers';
import { ProviderSDK } from '@lido-sdk/react';

import { useLidoSDK } from './lido-sdk';
import { config } from 'config';
import { isSDKSupportedL2Chain } from 'consts/chains';

export const SDKLegacyProvider = ({ children }: PropsWithChildren) => {
  const { defaultChain, supportedChains, PROVIDER_POLLING_INTERVAL } = config;
  const { address } = useAccount();
  const { core, isL2, chainId } = useLidoSDK();

  const supportedChainIds = useMemo(
    () => supportedChains.filter((chain) => !isSDKSupportedL2Chain(chain)),
    [supportedChains],
  );

  const ethersWeb3Provider = useMemo(() => {
    if (isL2 || !core.web3Provider) return undefined;
    const { chain, web3Provider } = core;
    const transport = web3Provider.transport;

    const provider = new Web3Provider(transport, {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    });
    provider.pollingInterval = PROVIDER_POLLING_INTERVAL;
    return provider;
  }, [isL2, core, PROVIDER_POLLING_INTERVAL]);

  const onlyL1chainId = useMemo(() => {
    if (ethersWeb3Provider) {
      return chainId;
    }
    return defaultChain;
  }, [chainId, defaultChain, ethersWeb3Provider]);

  const onlyL1publicClient = usePublicClient({ chainId: onlyL1chainId });
  const publicMainnetClient = usePublicClient({ chainId: 1 });

  // only Web3Provider can accept viem transport
  const providerRpc = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      new Web3Provider(onlyL1publicClient!.transport, onlyL1chainId),
    [onlyL1chainId, onlyL1publicClient],
  );

  const providerMainnetRpc = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      new Web3Provider(publicMainnetClient!.transport, 1),
    [publicMainnetClient],
  );

  return (
    // @ts-expect-error Property children does not exist on type
    <ProviderSDK
      chainId={onlyL1chainId}
      supportedChainIds={supportedChainIds}
      providerWeb3={ethersWeb3Provider}
      providerRpc={providerRpc}
      providerMainnetRpc={providerMainnetRpc}
      account={address ?? undefined}
    >
      {children}
    </ProviderSDK>
  );
};
