import {
  type Transport,
  fallback,
  createTransport,
  InvalidParamsRpcError,
} from 'viem';

// Structural copy of viem's non-exported OnResponseFn
// (viem/_types/clients/transports/fallback.d.ts) — the `_types` deep path
// is blocked by viem's package.json `exports` under bundler resolution.
type OnResponseFn = (
  args: {
    method: string;
    params: unknown[];
    transport: ReturnType<Transport>;
  } & (
    | { error?: undefined; response: unknown; status: 'success' }
    | { error: Error; response?: undefined; status: 'error' }
  ),
) => void;

// We disable those methods so wagmi uses getLogs instead to watch events
// Filters are not suitable for public rpc and break when changing between fallbacks
const DISABLED_METHODS = [
  'eth_newFilter',
  'eth_getFilterChanges',
  'eth_uninstallFilter',
];

// This transport is read-only: signing, account and chain management always go
// through the connector provider (wagmi getConnectorClient), never through here.
// Blocking them guards against a signing request leaking to an HTTP RPC
// or reaching the wallet from an unexpected code path.
// Runtime counterpart of viem's type-level WalletRpcSchema — neither viem nor
// wagmi export such a list as a value.
const WALLET_METHODS = [
  'eth_accounts',
  'eth_requestAccounts',
  'eth_sendTransaction',
  'eth_sendRawTransaction',
  'eth_sign',
  'eth_signTransaction',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'personal_sign',
  'eth_decrypt',
  'eth_getEncryptionPublicKey',
  'wallet_grantPermissions',
  'wallet_addEthereumChain',
  'wallet_switchEthereumChain',
  'wallet_requestPermissions',
  'wallet_revokePermissions',
  'wallet_getPermissions',
  'wallet_watchAsset',
  'wallet_getCapabilities',
  'wallet_sendCalls',
  'wallet_getCallsStatus',
  'wallet_showCallsStatus',
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
export const runtimeMutableTransport = (
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
          methods: { exclude: [...DISABLED_METHODS, ...WALLET_METHODS] },
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
