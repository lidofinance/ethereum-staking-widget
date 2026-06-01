import { useMemo } from 'react';
import { EthereumProvider, JsonRpcRequest } from '@cowprotocol/widget-react';
import { ConnectorEventMap, useConnection, useWalletClient } from 'wagmi';

import { useDappStatus } from 'modules/web3';

import { OrderData, validateTx } from '../validate-tx';

type VerifyOrder = (order: OrderData) => string | null;

export const useCowSwapEthereumProvider = (
  verifySignedOrder: VerifyOrder,
  openTransactionGuardModal: (reason: string) => Promise<void>,
): EthereumProvider | undefined => {
  const { chainId } = useDappStatus();
  const { data: walletClient } = useWalletClient();
  const { connector } = useConnection();

  return useMemo(() => {
    if (!walletClient || !connector) return undefined;

    return {
      request: async <T>(payload: JsonRpcRequest): Promise<T> => {
        try {
          const { order, sanitizedRequest } = await validateTx(payload, {
            chainId,
            signer: walletClient.account.address,
          });

          // this prevents extra fields to be passed along with the orginal request
          payload = sanitizedRequest as typeof payload;

          // Validate order trade  params, order can be recovered from different signing methods
          if (order) {
            const error = verifySignedOrder(order);

            if (error) {
              throw new Error(
                `Signed order does not match validated order: ${error}`,
              );
            }
          }
        } catch (error) {
          if (error instanceof Error) {
            await openTransactionGuardModal(error.message);
          }
          throw error; // re-throw to ensure the error is propagated to the caller
        }

        return walletClient.request(
          payload as Parameters<typeof walletClient.request>[0],
          { dedupe: true },
        );
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
