import { useMemo } from 'react';
import { EthereumProvider, JsonRpcRequest } from '@cowprotocol/widget-react';
import { ConnectorEventMap, useConnection, useWalletClient } from 'wagmi';

import { BLOCKED_RPC_METHODS } from '../consts';
import { parseOrderFromSignRequest } from '../trade-guard/utils/verify-order';
import type { OrderFields } from '../trade-guard/utils/verify-order';

type VerifyOrder = (order: OrderFields) => string | null;

export const useCowSwapEthereumProvider = (
  verifySignedOrder: VerifyOrder,
): EthereumProvider | undefined => {
  const { data: walletClient } = useWalletClient();
  const { connector } = useConnection();

  return useMemo(() => {
    if (!walletClient || !connector) return undefined;

    return {
      request: <T>(args: JsonRpcRequest): Promise<T> => {
        if (BLOCKED_RPC_METHODS.has(args.method)) {
          return Promise.reject(
            new Error(`RPC method "${args.method}" is not allowed`),
          );
        }

        // Defense-in-depth: verify CowSwap order before signing
        if (args.method === 'eth_signTypedData_v4') {
          const order = parseOrderFromSignRequest(args.params);
          if (order) {
            const error = verifySignedOrder(order);
            if (error) {
              return Promise.reject(
                new Error(`Order signing rejected: ${error}`),
              );
            }
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
  }, [walletClient, connector, verifySignedOrder]);
};
