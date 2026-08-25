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
  InvalidParamsRpcError,
  isAddressEqual,
  getAddress,
} from 'viem';

import type { OnResponseFn } from 'viem/_types/clients/transports/fallback';
import type { Connection } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';
import { providersStore } from 'reef-knot/core-react';

// We disable those methods so wagmi uses getLogs instead to watch events
// Filters are not suitable for public rpc and break when changing between fallbacks
const DISABLED_METHODS = [
  'eth_newFilter',
  'eth_getFilterChanges',
  'eth_uninstallFilter',
];

// rejects eth_getLogs requests without address before they reach an RPC,
// public nodes choke on such block-wide scans
const assertGetLogsHasAddress = (requestParams: {
  method: string;
  params?: unknown;
}) => {
  if (
    requestParams.method !== 'eth_getLogs' ||
    !Array.isArray(requestParams.params)
  ) {
    return;
  }

  const [filter] = requestParams.params as [
    { address?: string | string[] } | undefined,
  ];
  // works for empty array, empty string and all falsish values
  if (!filter?.address?.length) {
    console.warn(
      '[runtimeMutableTransport] rejected eth_getLogs without address',
      requestParams,
    );
    throw new InvalidParamsRpcError(
      new Error(`Empty address for eth_getLogs is not supported`),
    );
  }
};

// Viem transport wrapper that delegates requests to a wallet-first fallback
// stack when a wallet provider is set at runtime via setter,
// or to the default stack otherwise
const runtimeMutableTransport = (
  mainTransports: Transport[],
): [Transport, (t: Transport | null) => void] => {
  let injectedTransport: Transport | null = null;

  // tuple [RuntimeMutableTransport(), injectedTransportSetter()]
  return [
    (params) => {
      let externalOnResponse: OnResponseFn | undefined;

      const instantiate = (transports: Transport[], withInjected: boolean) => {
        const instance = fallback(transports)(params);
        instance.value?.onResponse((response: Parameters<OnResponseFn>[0]) => {
          if (response.status === 'error') {
            console.warn(
              `[runtimeMutableTransport] error in RuntimeMutableTransport(using injected: ${withInjected})`,
              response,
            );
          }
          externalOnResponse?.(response);
        });
        return instance;
      };

      const defaultInstance = instantiate(mainTransports, false);

      // the wallet-first stack is memoized and rebuilt only when the setter
      // delivers another transport — connection changes are much rarer than requests
      let currentInjected: Transport | null = null;
      let injectedInstance: ReturnType<Transport> | null = null;

      const getActiveInstance = () => {
        if (injectedTransport !== currentInjected) {
          currentInjected = injectedTransport;
          injectedInstance = currentInjected
            ? instantiate([currentInjected, ...mainTransports], true)
            : null;
        }
        return injectedInstance ?? defaultInstance;
      };

      return createTransport(
        {
          key: 'RuntimeMutableTransport',
          name: 'RuntimeMutableTransport',
          // retries are handled by the fallback stacks inside
          retryCount: 0,
          methods: { exclude: DISABLED_METHODS },
          //@ts-expect-error viem cannot assign a concrete implementation to the generic EIP1193RequestFn
          async request(requestParams, options) {
            assertGetLogsHasAddress(requestParams);
            return getActiveInstance().request(requestParams, options);
          },
          // crucial cause we quack like a fallback transport and some connectors(WC) rely on this
          type: 'fallback',
        },
        // transport.value contents
        {
          // this is fallbackTransport specific field, used by WC connectors to extract rpc Urls,
          // we expose the default stack so they get our backend RPC first
          transports: defaultInstance.value?.transports,
          // part of the fallback transport interface we quack
          onResponse: (fn: OnResponseFn) => (externalOnResponse = fn),
        },
      );
    },
    (transport: Transport | null) => {
      injectedTransport = transport;
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
    const activeAccount =
      connection.accounts[0] && getAddress(connection.accounts[0]);
    return activeAccount &&
      hexToNumber(chainId) === connection.chainId &&
      accounts.some((account) =>
        isAddressEqual(getAddress(account), activeAccount),
      )
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
