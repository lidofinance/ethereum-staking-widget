import { useMemo } from 'react';
import { EthereumProvider, JsonRpcRequest } from '@cowprotocol/widget-react';
import { ConnectorEventMap, useConnection, useWalletClient } from 'wagmi';

import { useDappStatus } from 'modules/web3';

import { OrderData, validateRpcRequest } from '../validate-tx';
import { COWSWAP_ENABLED_CHAIN_IDS } from '../consts';

type VerifyOrder = (order: OrderData) => string | null;

export const useCowSwapEthereumProvider = (
  verifySignedOrder: VerifyOrder,
  openTransactionGuardModal: (reason: string) => Promise<void>,
): EthereumProvider | undefined => {
  const { chainId } = useDappStatus();
  const { data: walletClient } = useWalletClient();
  const { connector } = useConnection();

  return useMemo(() => {
    if (
      !walletClient ||
      !connector ||
      walletClient.chain.id !== chainId ||
      !COWSWAP_ENABLED_CHAIN_IDS.has(chainId)
    ) {
      return undefined;
    }
    return {
      request: async <T>(payload: JsonRpcRequest): Promise<T> => {
        try {
          const { order, sanitizedRequest } = await validateRpcRequest(
            payload,
            {
              chainId,
              signer: walletClient.account.address,
            },
          );

          // this prevents extra fields to be passed along with the orginal request
          payload = sanitizedRequest as typeof payload;

          // Validate order trade  params, order can be recovered from different signing methods
          if (order) {
            const error = verifySignedOrder(order);

            if (error) {
              throw new Error(error);
            }
          }
        } catch (error) {
          if (error instanceof Error) {
            await openTransactionGuardModal(error.message);
          }
          throw error; // re-throw to ensure the error is propagated to the caller
        }

        try {
          return walletClient.request(
            payload as Parameters<typeof walletClient.request>[0],
            { dedupe: true },
          );
        } catch (error) {
          console.error(
            '[useCowSwapEthereumProvider] Error during walletClient.request:',
            error,
          );
          // silent cowswap error to prevent huge error messages
          throw new Error('Failed to process RPC request');
        }
      },
      on: (eventName: string, handler: unknown) => {
        connector.emitter.on(
          eventName as keyof ConnectorEventMap,
          handler as never,
        );
      },
    };
  }, [
    walletClient,
    connector,
    chainId,
    verifySignedOrder,
    openTransactionGuardModal,
  ]);
};
