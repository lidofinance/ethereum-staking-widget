import { config } from 'config';
import { useMemo, useCallback, useRef } from 'react';
import {
  type Transport,
  fallback,
  createTransport,
  http,
  EIP1193Provider,
  custom,
  hexToNumber,
  Chain,
  UnsupportedProviderMethodError,
  InvalidParamsRpcError,
} from 'viem';

import type { OnResponseFn } from 'viem/_types/clients/transports/fallback';
import type { Connection } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';
import { providersStore } from 'reef-knot/core-react';

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

// The metaMask connector provider (@metamask/connect-evm) does not forward read
// requests to the wallet — it routes them over HTTP to public RPCs taken from
// chain.rpcUrls.default. Use the raw EIP-6963 extension provider instead,
// looked up by the rdns the connector itself declares.
// The extension is a session separate from the SDK connection (which may even be
// a mobile wallet over MWP), so only use it when it serves the same account and
// chain as the active connection; otherwise fall back to default transports.
const getMetaMaskInjectedProvider = async (
  connection: Connection,
): Promise<EIP1193Provider | null> => {
  const { rdns } = connection.connector;
  if (!rdns) return null;

  const provider = (typeof rdns === 'string' ? [rdns] : rdns)
    .map((rdns) => providersStore.findProvider({ rdns })?.provider)
    .find(Boolean);
  if (!provider) return null;
  try {
    const [accounts, chainId] = await Promise.all([
      provider.request({ method: 'eth_accounts' }),
      provider.request({ method: 'eth_chainId' }),
    ]);
    const activeAccount = connection.accounts[0]?.toLowerCase();
    return activeAccount &&
      hexToNumber(chainId) === connection.chainId &&
      accounts.some((account) => account.toLowerCase() === activeAccount)
      ? provider
      : null;
  } catch {
    return null;
  }
};

// resolves the wallet provider suitable for routing read requests through,
// or null when the connection has none (then default transports are used)
const getConnectionProvider = async (
  connection: Connection,
): Promise<EIP1193Provider | null> => {
  if (connection.connector.type === injected.type) {
    const provider = (await connection.connector.getProvider?.({
      chainId: connection.chainId,
    })) as EIP1193Provider | undefined;
    return provider ?? null;
  }
  if (connection.connector.type === metaMask.type) {
    return getMetaMaskInjectedProvider(connection);
  }
  return null;
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

    const transportMap: Record<number, Transport> = {};
    const setTransportMap: Record<number, (t: Transport | null) => void> = {};

    for (const chain of supportedChains) {
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
      transportMap[chain.id] = transport;
      setTransportMap[chain.id] = setTransport;
    }

    return { transportMap, setTransportMap };
  }, [backendRpcMap, supportedChains]);

  // guards against an earlier, slower invocation applying stale transports
  // over the ones set for the current connection
  const connectionSeqRef = useRef(0);

  const onActiveConnection = useCallback(
    async (activeConnection: Connection | null) => {
      const seq = ++connectionSeqRef.current;

      const provider = activeConnection
        ? await getConnectionProvider(activeConnection)
        : null;

      if (seq !== connectionSeqRef.current) return;

      for (const chain of supportedChains) {
        setTransportMap[chain.id](
          provider && chain.id === activeConnection?.chainId
            ? custom(provider)
            : null,
        );
      }
    },
    [setTransportMap, supportedChains],
  );

  return { transportMap, onActiveConnection };
};
