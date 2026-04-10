import { useMemo } from 'react';
import { EthereumProvider, JsonRpcRequest } from '@cowprotocol/widget-react';
import { ConnectorEventMap, useConnection, useWalletClient } from 'wagmi';

import { BLOCKED_RPC_METHODS } from './consts';

export const useCowSwapEthereumProvider = (): EthereumProvider | undefined => {
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
  }, [walletClient, connector]);
};
