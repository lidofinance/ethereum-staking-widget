// TODO: move this to dedicated web3 configuration module

import { useMemo, useCallback } from 'react';
import {
  Transport,
  fallback,
  createTransport,
  http,
  EIP1193Provider,
  custom,
  Chain,
} from 'viem';
import { Connection } from 'wagmi';

// Viem transport wrapper that allows runtime changes via setter
const runtimeMutableTransport = (
  mainTransports: Transport[],
): [Transport, (t: Transport | null) => void] => {
  let withInjectedTransport: Transport | null = null;
  return [
    (params) => {
      const defaultTransport = fallback(mainTransports)(params);

      return createTransport(
        {
          key: 'RuntimeMutableTransport',
          name: 'RuntimeMutableTransport',
          //@ts-expect-error invalid typings
          async request(requestParams, options) {
            const transport = withInjectedTransport
              ? withInjectedTransport(params)
              : defaultTransport;
            return transport.request(requestParams, options);
          },
          type: 'fallback',
        },
        {
          transports: defaultTransport.value?.transports,
        },
      );
    },
    (injectedTransport: Transport | null) => {
      if (injectedTransport) {
        withInjectedTransport = fallback([
          injectedTransport,
          ...mainTransports,
        ]);
      } else {
        withInjectedTransport = null;
      }
    },
  ];
};

// returns Viem transport map that uses browser wallet RPC provider when avaliable fallbacked by our RPC
export const useWeb3Transport = (
  supportedChains: Chain[],
  backendRpcMap: Record<number, string>,
) => {
  const { transportMap, setTransportMap } = useMemo(() => {
    return supportedChains.reduce(
      ({ transportMap, setTransportMap }, chain) => {
        const [transport, setTransport] = runtimeMutableTransport([
          http(backendRpcMap[chain.id], {
            batch: true,
            name: backendRpcMap[chain.id],
          }),
          http(),
        ]);
        return {
          transportMap: {
            ...transportMap,
            [chain.id]: transport,
          },
          setTransportMap: {
            ...setTransportMap,
            [chain.id]: setTransport,
          },
        };
      },
      {
        transportMap: {} as Record<number, Transport>,
        setTransportMap: {} as Record<number, (t: Transport | null) => void>,
      },
    );
  }, [supportedChains, backendRpcMap]);

  const onActiveConnection = useCallback(
    async (activeConnection: Connection | null) => {
      for (const chain of supportedChains) {
        const setTransport = setTransportMap[chain.id];
        if (
          activeConnection &&
          chain.id === activeConnection.chainId &&
          activeConnection.connector.type === 'injected'
        ) {
          const provider = (await activeConnection.connector?.getProvider?.({
            chainId: chain.id,
          })) as EIP1193Provider | undefined;

          setTransport(provider ? custom(provider) : null);
        } else setTransport(null);
      }
    },
    [setTransportMap, supportedChains],
  );

  return { transportMap, onActiveConnection };
};
