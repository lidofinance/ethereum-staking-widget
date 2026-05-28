import { useMemo } from 'react';
import { EthereumProvider, JsonRpcRequest } from '@cowprotocol/widget-react';
import { ConnectorEventMap, useConnection, useWalletClient } from 'wagmi';

import { useDappStatus } from 'modules/web3';

import {
  BLOCKED_RPC_METHODS,
  BLOCKED_RPC_NAMESPACES,
  COWSWAP_WIDGET_ALLOWED_RPC_METHODS,
} from '../consts';
import {
  validateSendTransaction,
  validateSendCalls,
  OrderData,
  validateSignTypedData,
} from '../validate-tx';

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
      request: async <T>(args: JsonRpcRequest): Promise<T> => {
        const ctx = {
          chainId,
          signer: walletClient.account.address,
        };

        let order: OrderData | undefined = undefined;

        // Level 1: block dangerous RPC methods
        if (BLOCKED_RPC_METHODS.has(args.method)) {
          throw new Error(`RPC method "${args.method}" is not allowed`);
        }

        // Defense-in-depth: verify CowSwap order before signing
        else if (args.method === 'eth_signTypedData_v4') {
          // !NB: this validation modifies the params to override the wstETH permit deadline
          const { allowed, result, reason } = await validateSignTypedData(
            args.params,
            ctx,
          );

          if (!allowed) {
            console.warn('[DEX Provider] Signing Typed Data blocked:', reason);
            throw new Error(reason);
          }
          if (result) {
            order = result;
          }
        } else if (args.method === 'eth_sendTransaction') {
          const result = await validateSendTransaction(args.params, ctx);
          if (!result.allowed) {
            console.warn('[DEX Provider] Transaction blocked:', result.reason);
            throw new Error(result.reason);
          }
          if (result.result) {
            order = result.result;
          }
        } else if (args.method === 'wallet_sendCalls') {
          const result = await validateSendCalls(args.params, ctx);
          if (!result.allowed) {
            console.warn('[DEX Provider] Batch call blocked:', result.reason);
            throw new Error(result.reason);
          }
          if (result.result) {
            order = result.result;
          }
        }
        // Last line of defense, against unexpected RPC methods
        //  that don't pass namespace filter and are not explicitly allowed
        else if (
          BLOCKED_RPC_NAMESPACES.test(args.method) &&
          !COWSWAP_WIDGET_ALLOWED_RPC_METHODS.has(args.method)
        ) {
          console.warn(
            `[DEX Provider] RPC method "${args.method}" blocked by namespace filter`,
          );
          throw new Error(`RPC method "${args.method}" is not allowed`);
        }

        // Validate order trade  params, order can be recovered from different signing methods
        if (order) {
          const error = verifySignedOrder(order);

          if (error) {
            throw new Error(`Order signing rejected: ${error}`);
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
