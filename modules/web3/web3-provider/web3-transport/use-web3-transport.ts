import { config } from 'config';
import { useMemo, useCallback, useRef } from 'react';
import { type Transport, http, custom, Chain } from 'viem';

import type { Connection } from 'wagmi';

import { runtimeMutableTransport } from './runtime-mutable-transport';
import { getConnectionProvider } from './get-connection-provider';

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
