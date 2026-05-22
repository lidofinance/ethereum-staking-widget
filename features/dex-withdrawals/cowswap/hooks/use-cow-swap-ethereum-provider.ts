import { useMemo } from 'react';
import { EthereumProvider, JsonRpcRequest } from '@cowprotocol/widget-react';
import { ConnectorEventMap, useConnection, useWalletClient } from 'wagmi';

import { useDappStatus } from 'modules/web3';

import { BLOCKED_RPC_METHODS } from '../consts';
import {
  validateSendTransaction,
  validateSendCalls,
  validateSignTypedData,
  OrderData,
} from '../validate-tx/validate-tx';

type VerifyOrder = (order: OrderData) => string | null;

export const useCowSwapEthereumProvider = (
  verifySignedOrder: VerifyOrder,
): EthereumProvider | undefined => {
  const { chainId } = useDappStatus();
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
        // Defense-in-depth: verify CowSwap order before signing
        else if (args.method === 'eth_signTypedData_v4') {
          const {
            allowed,
            result: order,
            reason,
          } = validateSignTypedData(args.params, {
            chainId,
            signer: walletClient.account.address,
          });
          if (!allowed) {
            console.warn('[DEX Provider] Signing Typed Data blocked:', reason);
            return Promise.reject(new Error(reason));
          }
          const error = verifySignedOrder(order);

          if (error) {
            return Promise.reject(
              new Error(`Order signing rejected: ${error}`),
            );
          }
        } else if (args.method === 'eth_sendTransaction') {
          const result = validateSendTransaction(args.params, chainId);
          if (!result.allowed) {
            console.warn('[DEX Provider] Transaction blocked:', result.reason);
            return Promise.reject(new Error(result.reason));
          }
        } else if (args.method === 'wallet_sendCalls') {
          const result = validateSendCalls(args.params, chainId);
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
  }, [walletClient, connector, chainId, verifySignedOrder]);
};
