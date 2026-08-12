import { useCallback, useEffect, useMemo, useRef } from 'react';
import { EthereumProvider, JsonRpcRequest } from '@cowprotocol/widget-react';
import { useConnection, useWalletClient } from 'wagmi';
import { InvalidRequestRpcError, toHex, UserRejectedRequestError } from 'viem';

import { useDappStatus, useIsLedgerLive } from 'modules/web3';
import { ErrorMessage, extractCodeFromError } from 'utils/getErrorMessage';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_ERROR_EVENTS_TYPES } from 'consts/matomo';

import { OrderData, validateRpcRequest } from '../validate-tx';
import { COWSWAP_ENABLED_CHAIN_IDS } from '../consts';
import {
  SIGN_DECLINED_MESSAGE,
  SIGN_DECLINED_HELP_TIP,
} from '../trade-guard/consts';
import type { SigningHelpTip } from '../trade-guard/trade-guard-modal';

type VerifyOrder = (order: OrderData) => string | null;

export const useCowSwapEthereumProvider = (
  verifySignedOrder: VerifyOrder,
  openTransactionGuardModal: (reason: string) => Promise<void>,
  openSigningErrorModal: (
    reason: string,
    helpTip?: SigningHelpTip,
  ) => Promise<void>,
): {
  provider: EthereumProvider | undefined;
  onWidgetReady: () => void;
} => {
  const { chainId } = useDappStatus();
  const { data: walletClient } = useWalletClient();
  const { connector } = useConnection();
  const isLedgerLive = useIsLedgerLive();

  // Per-instance registries: on rapid unmount/remount two hook instances
  // coexist briefly, and a shared registry would let the old instance detach
  // handlers belonging to the new instance's live bridge
  const cleanupSetRef = useRef(new Set<() => void>());
  // 'connect' emissions deferred until the widget iframe reports READY —
  // posted earlier they are lost (app not booted) or dropped by wagmi
  // while its status is 'connecting'/'reconnecting'
  const pendingConnectRef = useRef(new Set<() => void>());
  const isWidgetReadyRef = useRef(false);

  const cleanup = useCallback(() => {
    for (const fn of cleanupSetRef.current) {
      try {
        fn();
      } catch (error) {
        console.error('[useCowSwapEthereumProvider] Cleanup error:', error);
      }
    }
    cleanupSetRef.current.clear();
    pendingConnectRef.current.clear();
  }, []);

  const onWidgetReady = useCallback(() => {
    isWidgetReadyRef.current = true;
    for (const emitConnect of pendingConnectRef.current) {
      emitConnect();
    }
    pendingConnectRef.current.clear();
  }, []);

  // clean up on unmount
  useEffect(() => cleanup, [cleanup]);

  const provider = useMemo<EthereumProvider | undefined>(() => {
    if (
      !walletClient ||
      !connector ||
      walletClient.chain.id !== chainId ||
      !COWSWAP_ENABLED_CHAIN_IDS.has(chainId)
    ) {
      return undefined;
    }
    cleanup();
    // widget-react recreates the iframe for every new provider identity,
    // so a new READY signal must arrive before 'connect' can be delivered
    isWidgetReadyRef.current = false;
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
          // The CoW iframe ignores thrown error messages and renders its own
          // text per error code — custom explanations go through our modal
          switch (extractCodeFromError(error)) {
            case 'ACTION_REJECTED':
              // Ledger Live reports any signing failure as a generic decline —
              // blind signing disabled is indistinguishable from a user cancel
              if (isLedgerLive && payload.method === 'eth_signTypedData_v4') {
                trackMatomoEvent(
                  MATOMO_ERROR_EVENTS_TYPES.DENIED_SIG_LEDGER_LIVE,
                );
                await openSigningErrorModal(
                  SIGN_DECLINED_MESSAGE,
                  SIGN_DECLINED_HELP_TIP,
                );
              }
              throw {
                code: UserRejectedRequestError.code,
                message: ErrorMessage.DENIED_SIG,
              };
            case 'ENABLE_BLIND_SIGNING':
              await openSigningErrorModal(ErrorMessage.ENABLE_BLIND_SIGNING);
              throw {
                code: UserRejectedRequestError.code,
                message: ErrorMessage.ENABLE_BLIND_SIGNING,
              };
            case 'DEVICE_LOCKED':
              await openSigningErrorModal(ErrorMessage.DEVICE_LOCKED);
              throw {
                code: UserRejectedRequestError.code,
                message: ErrorMessage.DEVICE_LOCKED,
              };
            default:
              console.error(
                '[useCowSwapEthereumProvider] Error during provider request:',
                error,
              );

              // throw error further
              throw error;
          }
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
            cleanupSetRef.current.add(() => {
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
            cleanupSetRef.current.add(() => {
              connector?.emitter?.off?.('change', connectorHandler);
            });
            break;
          case 'connect': {
            // connect event has side effects in wagmi connectors, but if we are here, connector is ready
            // https://github.com/wevm/wagmi/blob/81b621114a75d5ee94e9bb7d52c94c7d9b8ca1a8/packages/core/src/connectors/injected.ts#L462
            const emitConnect = () => {
              handlerFn({ chainId: toHex(chainId) });
            };
            if (isWidgetReadyRef.current) {
              emitConnect();
            } else {
              pendingConnectRef.current.add(emitConnect);
            }
            break;
          }
          case 'disconnect':
          case 'close':
            connectorHandler = (error: any) => {
              handlerFn(error);
            };
            connector.emitter.on('disconnect', connectorHandler);
            cleanupSetRef.current.add(() => {
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
    isLedgerLive,
    cleanup,
    verifySignedOrder,
    openTransactionGuardModal,
    openSigningErrorModal,
  ]);

  return { provider, onWidgetReady };
};
