import { useMemo } from 'react';
import { EthereumProvider, JsonRpcRequest } from '@cowprotocol/widget-react';
import { ConnectorEventMap, useConnection, useWalletClient } from 'wagmi';

import { BLOCKED_RPC_METHODS } from './consts';
import { validateSendTransaction, validateSendCalls } from './validate-tx';

export const useCowSwapEthereumProvider = (
  chainId: number,
): EthereumProvider | undefined => {
  const { data: walletClient } = useWalletClient();
  const { connector } = useConnection();

  return useMemo(() => {
    if (!walletClient || !connector) return undefined;

    return {
      request: <T>(args: JsonRpcRequest): Promise<T> => {
        // Level 1: block dangerous RPC methods
        if (BLOCKED_RPC_METHODS.has(args.method)) {
          return Promise.reject(
            new Error(`RPC method "${args.method}" is not allowed`),
          );
        }

        // Level 2+3: deep transaction parameter validation
        if (args.method === 'eth_sendTransaction') {
          const result = validateSendTransaction(
            args.params as unknown[],
            chainId,
          );
          if (!result.allowed) {
            console.warn('[DEX Provider] Transaction blocked:', result.reason);
            return Promise.reject(new Error(result.reason));
          }
        }

        if (args.method === 'wallet_sendCalls') {
          const result = validateSendCalls(
            args.params as unknown[],
            chainId,
          );
          if (!result.allowed) {
            console.warn('[DEX Provider] Batch call blocked:', result.reason);
            return Promise.reject(new Error(result.reason));
          }
        }

        return walletClient.request(
          args as Parameters<typeof walletClient.request>[0],
        );
      },
      on: (eventName: string, handler: unknown) => {
        connector.emitter.on(
          eventName as keyof ConnectorEventMap,
          handler as never,
        );
      },
    };
  }, [walletClient, connector, chainId]);
};
