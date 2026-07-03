import { useMemo } from 'react';
import { EthereumProvider, JsonRpcRequest } from '@cowprotocol/widget-react';
import { useConnection, useWalletClient } from 'wagmi';
import { InvalidRequestRpcError, toHex, UserRejectedRequestError } from 'viem';

import { useDappStatus } from 'modules/web3';
import { ErrorMessage } from 'utils/getErrorMessage';

import { OrderData, validateRpcRequest } from '../validate-tx';
import { COWSWAP_ENABLED_CHAIN_IDS } from '../consts';

type VerifyOrder = (order: OrderData) => string | null;

const CLEANUP_SET = new Set<() => void>();

const addCleanup = (fn: () => void) => {
  CLEANUP_SET.add(fn);
};

const cleanup = () => {
  for (const fn of CLEANUP_SET) {
    try {
      fn();
    } catch (error) {
      console.error('[useCowSwapEthereumProvider] Cleanup error:', error);
    }
  }
  CLEANUP_SET.clear();
};

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
      cleanup();
      return undefined;
    }
    return {
      request: async <T>(payload: JsonRpcRequest): Promise<T> => {
        // transaction request block
        try {
          // validation block, opens modal and throws error if validation fails
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

            throw {
              code: InvalidRequestRpcError.code,
              message: ErrorMessage.SOMETHING_WRONG,
            };
          }
          // NB!: client.request can throw on timeout for actions like signing
          // this is not a behavior wallet specific methods client.sign<...> have
          // but it's hard to match raw RPC body to viem dev-friendly args and methods
          return await walletClient.request(
            payload as Parameters<typeof walletClient.request>[0],
            { dedupe: true, retryCount: 0 },
          );
        } catch (error) {
          console.error(
            '[useCowSwapEthereumProvider] Error during walletClient.request:',
            error,
          );

          // Handle specific error cases and throw user-friendly messages
          if (error instanceof UserRejectedRequestError) {
            throw {
              code: UserRejectedRequestError.code,
              message: ErrorMessage.DENIED_SIG,
            };
          }

          // throw error further
          throw error;
        }
      },
      on: (eventName: string, handler: unknown) => {
        // Connecting EIP1193 provider events to wagmi connector events
        // Wagmi connector can be made from EIP1193 provider, but not the other way around
        // Cowswap provider: https://eips.ethereum.org/EIPS/eip-1193
        // Wagmi connector: https://github.com/wevm/wagmi/blob/main/packages/core/src/connectors/injected.ts
        const handlerFn = handler as (args: any) => void;

        let connectorHandler: Parameters<
          NonNullable<typeof connector>['emitter']['on']
        >[1];

        switch (eventName) {
          case 'accountsChanged':
            connectorHandler = ({ accounts }: any) => {
              if (accounts && Array.isArray(accounts)) {
                handlerFn(accounts);
              }
            };
            connector.emitter.on('change', connectorHandler);
            addCleanup(() => {
              connector?.emitter?.off?.('change', connectorHandler);
            });
            break;
          case 'chainChanged':
            connectorHandler = ({ chainId }: any) => {
              if (chainId) {
                handlerFn(toHex(chainId));
              }
            };
            connector.emitter.on('change', connectorHandler);
            addCleanup(() => {
              connector?.emitter?.off?.('change', connectorHandler);
            });
            break;
          case 'connect':
            // connect event has side effects in wagmi connectors, but if we are here, connector is ready so we can emit event in next tick
            // https://github.com/wevm/wagmi/blob/81b621114a75d5ee94e9bb7d52c94c7d9b8ca1a8/packages/core/src/connectors/injected.ts#L462
            setTimeout(() => {
              handlerFn({ chainId: toHex(chainId) });
            }, 0);
            break;
          case 'disconnect':
          case 'close':
            connectorHandler = (error: any) => {
              handlerFn(error);
            };
            connector.emitter.on('disconnect', connectorHandler);
            addCleanup(() => {
              connector?.emitter?.off?.('disconnect', connectorHandler);
            });
            break;
          default:
            console.warn(
              `[useCowSwapEthereumProvider] Unhandled event: ${eventName}`,
            );
        }
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
