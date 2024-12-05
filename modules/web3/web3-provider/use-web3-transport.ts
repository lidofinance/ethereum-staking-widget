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

// We disable those methods so wagmi uses getLogs instead to watch events
// Filters are not suitable for public rpc and break when changing between fallbacks
const DISABLED_METHODS = new Set([
  'eth_newFilter',
  'eth_getFilterChanges',
  'eth_uninstallFilter',
]);

// Viem transport wrapper that allows runtime changes via setter
const runtimeMutableTransport = (
  mainTransports: Transport[],
): [Transport, (t: Transport | null) => void] => {
  let withInjectedTransport: Transport | null = null;

  // tuple [RuntimeMutableTransport(), injectedTransporterSetter()]
  return [
    (params) => {
      const defaultTransport = fallback(mainTransports)(params);
      let externalOnResponse: OnResponseFn;

      const onResponse: OnResponseFn = (params) => {
        if (params.status === 'error' && !(params as any).skipLog) {
          console.warn(
            `[runtimeMutableTransport] error in RuntimeMutableTransport(using injected: ${!!withInjectedTransport})`,
            params,
          );
        }
        externalOnResponse?.(params);
      };

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
              onResponse({
                error,
                method: requestParams.method,
                params: params as unknown[],
                transport,
                status: 'error',
                // skip logging because we expect wagmi to try those
                skipLog: true,
              } as any);
              throw error;
            }

            if (
              requestParams.method === 'eth_getLogs' &&
              Array.isArray(requestParams?.params) &&
              // works for empty array, empty string and all falsish values
              !requestParams.params[0]?.address?.length
            ) {
              const error = new InvalidParamsRpcError(
                new Error(`Empty address for eth_getLogs is not supported`),
              );
              onResponse({
                error,
                method: requestParams.method,
                params: params as unknown[],
                transport,
                status: 'error',
              });
              throw error;
            }

            transport.value?.onResponse(onResponse);
            return transport.request(requestParams, options);
          },
          // crucial cause we quack like a fallback transport and some connectors(WC) rely on this
          type: 'fallback',
        },
        // transport.value contents
        {
          // this is fallbackTransport specific field, used by WC connectors to extract rpc Urls
          // we can use defaultTransport because no injected transport
          transports: defaultTransport.value?.transports,
          // providers that use this transport, use this to set onResponse callback for transport,
          onResponse: (fn: OnResponseFn) => (externalOnResponse = fn),
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

// returns Viem transport map that uses browser wallet RPC provider when available fallbacked by our RPC and default RPCs
export const useWeb3Transport = (
  supportedChains: Chain[],
  backendRpcMap: Record<number, string>,
) => {
  const { transportMap, setTransportMap } = useMemo(() => {
    const batchConfig = {
      wait: config.PROVIDER_BATCH_TIME,
      batchSize: config.PROVIDER_MAX_BATCH,
    };

    return supportedChains.reduce(
      ({ transportMap, setTransportMap }, chain) => {
        const [transport, setTransport] = runtimeMutableTransport([
          // api/rpc
          http(backendRpcMap[chain.id], {
            batch: batchConfig,
            name: backendRpcMap[chain.id],
          }),
          // fallback rpc from wagmi.chains like cloudfare-eth
          http(undefined, {
            batch: batchConfig,
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
  }, [backendRpcMap, supportedChains]);

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
