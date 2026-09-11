import { config } from 'config';
import { useMemo } from 'react';
import { type Transport, http, custom, Chain } from 'viem';

import type { Connection } from 'wagmi';

import { runtimeMutableTransport } from './runtime-mutable-transport';
import { getConnectionProvider } from './get-connection-provider';

// Applies the active connection's wallet provider to the transport map.
// Fail-safe ordering: the previous wallet transport is dropped synchronously
// before the next provider resolves, so reads never keep flowing through an
// obsolete connection; a sequence counter rejects late resolutions of an
// earlier, slower invocation.
export const createActiveConnectionListener = (
  supportedChains: Chain[],
  setTransportMap: Record<number, (t: Transport | null) => void>,
) => {
  let connectionSeq = 0;

  return async (activeConnection: Connection | null) => {
    const seq = ++connectionSeq;

    for (const chain of supportedChains) {
      setTransportMap[chain.id](null);
    }

    if (!activeConnection) return;

    const provider = await getConnectionProvider(activeConnection);

    if (!provider || seq !== connectionSeq) return;

    setTransportMap[activeConnection.chainId]?.(custom(provider));
  };
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

  const onActiveConnection = useMemo(
    () => createActiveConnectionListener(supportedChains, setTransportMap),
    [setTransportMap, supportedChains],
  );

  return { transportMap, onActiveConnection };
};
