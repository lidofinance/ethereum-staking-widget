import React, { PropsWithChildren, useMemo } from 'react';
import { useAccount, usePublicClient } from 'wagmi';

import { type Network, Web3Provider } from '@ethersproject/providers';
import { ProviderSDK } from '@lido-sdk/react';

import { useLidoSDK } from './lido-sdk';
import { config } from 'config';
import { isSDKSupportedL2Chain } from 'consts/chains';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';

// Stabilizes network detection to prevent repeated chainId calls
class EthersToViemProvider extends Web3Provider {
  detectNetwork(): Promise<Network> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    if (!this._cache['detectNetwork']) {
      this._cache['detectNetwork'] = this._uncachedDetectNetwork();
    }
    return this._cache['detectNetwork'];
  }
}

export const SDKLegacyProvider = ({ children }: PropsWithChildren) => {
  const { defaultChain, supportedChains, PROVIDER_POLLING_INTERVAL } = config;
  const { address, isConnected } = useAccount();
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

  const onlyL1chainId = isConnected && !isL2 ? chainId : defaultChain;
  const onlyL1publicClient = usePublicClient({ chainId: onlyL1chainId });
  const publicMainnetClient = usePublicClient({ chainId: 1 });

  const providerRpc = useMemo(() => {
    return (
      onlyL1publicClient &&
      new EthersToViemProvider(onlyL1publicClient.transport, onlyL1chainId)
    );
  }, [onlyL1chainId, onlyL1publicClient]);

  // Fallback for when mainnet is not present in supported chains
  const staticMainnetProvider = useMainnetStaticRpcProvider();

  const providerMainnetRpc = useMemo(() => {
    return publicMainnetClient
      ? new EthersToViemProvider(publicMainnetClient.transport, 1)
      : staticMainnetProvider;
  }, [publicMainnetClient, staticMainnetProvider]);

  return (
    // @ts-expect-error Property children does not exist on type
    <ProviderSDK
      chainId={onlyL1chainId}
      supportedChainIds={supportedChainIds}
      providerWeb3={ethersWeb3Provider}
      providerRpc={providerRpc}
      providerMainnetRpc={providerMainnetRpc}
      account={ethersWeb3Provider && address ? address : undefined}
    >
      {children}
    </ProviderSDK>
  );
};
