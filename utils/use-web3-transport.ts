import { config } from 'config';
import { useMemo, useCallback } from 'react';
import {
  type Transport,
  fallback,
  createTransport,
  http,
  EIP1193Provider,
  custom,
  Chain,
  UnsupportedProviderMethodError,
  InvalidParamsRpcError,
} from 'viem';
import type { OnResponseFn } from 'viem/_types/clients/transports/fallback';
import type { Connection } from 'wagmi';

// We disable those methods so wagmi uses getLogs intestead to watch events
// Filters are not suitable for public rpc and break between fallbacks
const DISABLED_METHODS = new Set([
  'eth_newFilter',
  'eth_getFilterChanges',
  'eth_uninstallFilter',
]);

const NOOP = () => {};

// Viem transport wrapper that allows runtime changes via setter
const runtimeMutableTransport = (
  mainTransports: Transport[],
): [Transport, (t: Transport | null) => void] => {
  let withInjectedTransport: Transport | null = null;
  return [
    (params) => {
      const defaultTransport = fallback(mainTransports)(params);
      let responseFn: OnResponseFn = NOOP;
      return createTransport(
        {
          key: 'RuntimeMutableTransport',
          name: 'RuntimeMutableTransport',
          //@ts-expect-error invalid typings
          async request(requestParams, options) {
            const transport = withInjectedTransport
              ? withInjectedTransport(params)
              : defaultTransport;

            if (DISABLED_METHODS.has(requestParams.method)) {
              const error = new UnsupportedProviderMethodError(
                new Error(`Method ${requestParams.method} is not supported`),
              );
              responseFn({
                error,
                method: requestParams.method,
                params: params as unknown[],
                transport,
                status: 'error',
              });
              throw error;
            }

            if (
              requestParams.method === 'eth_getLogs' &&
              Array.isArray(requestParams?.params) &&
              requestParams.params[0]?.address?.length < 0
            ) {
              const error = new InvalidParamsRpcError(
                new Error(`Empty address for eth_getLogs is not supported`),
              );
              responseFn({
                error,
                method: requestParams.method,
                params: params as unknown[],
                transport,
                status: 'error',
              });
              throw error;
            }

            transport.value?.onResponse(responseFn);
            return transport.request(requestParams, options);
          },
          type: 'fallback',
        },
        {
          transports: defaultTransport.value?.transports,
          onResponse: (fn: OnResponseFn) => (responseFn = fn),
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
            batch: {
              wait: config.PROVIDER_BATCH_TIME,
              batchSize: config.PROVIDER_MAX_BATCH,
            },
            name: backendRpcMap[chain.id],
          }),
          http(undefined, {
            batch: {
              wait: config.PROVIDER_BATCH_TIME,
              batchSize: config.PROVIDER_MAX_BATCH,
            },
            name: 'default HTTP RPC',
          }),
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
