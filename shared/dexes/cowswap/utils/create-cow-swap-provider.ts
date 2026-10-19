import type {
  EthereumProvider,
  JsonRpcRequest,
} from '@cowprotocol/widget-react';
import type { Connector } from 'wagmi';
import {
  InvalidRequestRpcError,
  toHex,
  UserRejectedRequestError,
  type Account,
  type Chain,
  type Transport,
  type WalletClient,
} from 'viem';

import { ErrorMessage, extractCodeFromError } from 'utils/getErrorMessage';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_ERROR_EVENTS_TYPES } from 'consts/matomo';

import {
  validateRpcRequest,
  TRANSACTION_ERROR,
  SIGN_DECLINED_MESSAGE,
  SIGN_DECLINED_HELP_TIP,
  type ApprovalData,
  type OrderData,
  type NetworkTxConfig,
} from '../guards/tx';
import type { SigningHelpTip } from '../guards/trade';

const WALLET_SIGNING_METHODS = new Set([
  'eth_signTypedData_v4',
  'eth_sendTransaction',
  'wallet_sendCalls',
]);

export type CreateCowSwapProviderParams = {
  walletClient: WalletClient<Transport, Chain, Account>;
  connector: Connector;
  chainId: number;
  isLedgerLive: boolean;
  networkTxConfig: NetworkTxConfig;
  appCode: string;
  verifySignedOrder: (order: OrderData) => string | null;
  verifyApproval: (approval: ApprovalData) => string | null;
  openTransactionGuardModal: (reason: string) => Promise<void>;
  openSigningErrorModal: (
    reason: string,
    helpTip?: SigningHelpTip,
  ) => Promise<void>;
  addCleanup: (fn: () => void) => void;
};

export const createCowSwapProvider = ({
  walletClient,
  connector,
  chainId,
  isLedgerLive,
  networkTxConfig,
  appCode,
  verifySignedOrder,
  verifyApproval,
  openTransactionGuardModal,
  openSigningErrorModal,
  addCleanup,
}: CreateCowSwapProviderParams): EthereumProvider => ({
  request: async <T>(payload: JsonRpcRequest): Promise<T> => {
    // transaction request block
    try {
      // validation block, opens modal and throws error if validation fails
      try {
        const { order, approvals, sanitizedRequest } = await validateRpcRequest(
          payload,
          {
            chainId,
            signer: walletClient.account.address,
            networkTxConfig,
            appCode,
          },
        );

        // this prevents extra fields to be passed along with the orginal request
        payload = sanitizedRequest as typeof payload;

        // Validate order trade  params, order can be recovered from different signing methods
        if (order) {
          const error = verifySignedOrder(order);

          if (error) throw new Error(error);
        }

        // Approve amount is bounded by the validated approval snapshot
        for (const approval of approvals) {
          const error = verifyApproval(approval);

          if (error) throw new Error(error);
        }

        // the wallet may have switched chains after validation config was resolved
        if (
          WALLET_SIGNING_METHODS.has(payload.method) &&
          (await walletClient.getChainId()) !== chainId
        ) {
          throw new Error(TRANSACTION_ERROR(2049));
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
            trackMatomoEvent(MATOMO_ERROR_EVENTS_TYPES.DENIED_SIG_LEDGER_LIVE);
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

    let connectorHandler: Parameters<Connector['emitter']['on']>[1];

    switch (eventName) {
      case 'accountsChanged':
        connectorHandler = ({ accounts }: any) => {
          if (accounts && Array.isArray(accounts)) handlerFn(accounts);
        };

        connector.emitter.on('change', connectorHandler);
        addCleanup(() => {
          connector?.emitter?.off?.('change', connectorHandler);
        });

        break;
      case 'chainChanged':
        connectorHandler = ({ chainId }: any) => {
          if (chainId) handlerFn(toHex(chainId));
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
});
