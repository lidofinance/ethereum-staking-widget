import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import type { Address } from 'viem';

import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useTxModalStagesRequest } from 'features/withdrawals/request/transaction-modal-request/use-tx-modal-stages-request';
import { useTransactionModal } from 'shared/transaction-modal/transaction-modal';
import type { TxRetryHandler } from 'shared/transaction-modal';
import {
  applyRoundUpTxParameter,
  isStepSettled,
  useDappStatus,
  useIsSmartAccount,
  useLidoSDK,
  useTxFlow,
  detectTxFlowInterruption,
} from 'modules/web3';
import { config } from 'config';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import { ErrorMessage } from 'utils/getErrorMessage';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { useWithdrawalRequestTxApprove } from './use-withdrawal-request-tx-approve';

type UseWithdrawalRequestArgs = {
  amount: bigint | null;
  token: TOKENS_TO_WITHDRAWLS;
  onConfirm?: () => Promise<void>;
  onRetry?: TxRetryHandler;
};

type RequestArgs = {
  requests: bigint[] | null;
  amount: bigint | null;
  token: TOKENS_TO_WITHDRAWLS;
};

// the steps of a request, the first one only for an allowance short of the
// amount that is approved rather than covered by a permit
const STEP = { approve: 'approve', request: 'request' } as const;

// what every stage of a request needs, read once before the first step
type RequestData = {
  address: Address;
  // The withdrawal queue pulls the tokens, so it needs an allowance first.
  // Read here rather than taken from the form state, so a retry after a
  // confirmed approval never approves again
  needsApprove: boolean;
  // An EOA short of allowance signs a permit that goes with the request,
  // unless the user chose the allowance flow instead
  isPermit: boolean;
};

export const useWithdrawalRequest = ({
  amount,
  token,
  onConfirm,
  onRetry,
}: UseWithdrawalRequestArgs) => {
  const { address } = useDappStatus();
  const { isBunker } = useWithdrawals();
  const { withdraw } = useLidoSDK();
  const { txModalStages } = useTxModalStagesRequest();
  const txFlow = useTxFlow();
  const { hasBytecode } = useIsSmartAccount();
  const {
    allowance,
    isApprovalFlow,
    isApprovalFlowLoading,
    isTokenLocked,
    refetchAllowance,
    isForceAllowance,
    setIsForceAllowance,
  } = useWithdrawalRequestTxApprove({ amount, token });

  const { closeModal } = useTransactionModal();

  const request = useCallback(
    async ({ requests, amount, token }: RequestArgs): Promise<boolean> => {
      invariant(
        requests && requests.length > 0,
        'cannot submit empty requests',
      );
      invariant(amount, 'cannot submit empty amount');
      // The modal shows `amount` and the approval covers it, every path sends
      // `requests`: one total for all of them
      invariant(
        requests.reduce((total, value) => total + value, 0n) === amount,
        'requests do not add up to the amount',
      );

      const onTryAllowance = () => {
        closeModal();
        setIsForceAllowance(true);
      };

      if (isBunker) {
        const bunkerDialogResult = await txModalStages.dialogBunker();
        if (!bunkerDialogResult) {
          return false;
        }
      }

      let isSigningPermit = false;

      const { isSuccess } = await txFlow<RequestData>({
        prepare: async ({ isAA }) => {
          invariant(address, 'account is not defined');
          const currentAllowance = await withdraw.approval.getAllowance({
            account: address,
            token,
          });
          const needsApprove = currentAllowance < amount;
          return {
            address,
            needsApprove,
            // a contract cannot sign a permit and an AA wallet batches the
            // approval with the request
            isPermit:
              needsApprove && !isAA && !hasBytecode && !isForceAllowance,
          };
        },
        // the approval joins the batch for AA wallets and goes as a separate
        // transaction otherwise
        callsFn: async ({ data }) => {
          const [approveTx, requestTx] = await Promise.all([
            data.needsApprove && !data.isPermit
              ? withdraw.approval.approvePopulateTx({ amount, token })
              : null,
            withdraw.request.requestWithdrawalPopulateTx({
              requests,
              token,
              receiver: data.address,
            }),
          ]);
          return [
            approveTx && { stepId: STEP.approve, ...approveTx },
            { stepId: STEP.request, ...requestTx },
          ];
        },
        sendStep: async (step, txStagesCallback, { data }) => {
          if (step.stepId === STEP.approve) {
            trackMatomoEvent(
              MATOMO_TX_EVENTS_TYPES.withdrawalRequestApprovalStart,
            );
            await withdraw.approval.approve({
              amount,
              token,
              callback: txStagesCallback,
            });
            return;
          }
          if (data.isPermit) {
            // ERC-2612 permit flow for EOAs (no batching)
            const deadline = applyRoundUpTxParameter(
              BigInt(Math.floor(Date.now() / 1000)) + 86_400n, // 1 day
            );
            await withdraw.request.requestWithdrawalWithPermit({
              requests,
              token,
              callback: txStagesCallback,
              deadline,
            });
            return;
          }
          await withdraw.request.requestWithdrawal({
            requests,
            token,
            callback: txStagesCallback,
          });
        },
        onPermit: () => {
          isSigningPermit = true;
          txModalStages.signPermit();
        },
        // an AA batch reports as its last step, the request
        onSign: ({ payload, ctx: { stepId, data } }) => {
          isSigningPermit = false;
          if (stepId === STEP.approve) {
            txModalStages.signApproval(amount, token);
            return;
          }
          txModalStages.sign(amount, token);
          const isSteth = token === TOKENS_TO_WITHDRAWLS.stETH;
          const fallback = data.isPermit
            ? isSteth
              ? config.WITHDRAWAL_QUEUE_REQUEST_STETH_PERMIT_GAS_LIMIT_DEFAULT
              : config.WITHDRAWAL_QUEUE_REQUEST_WSTETH_PERMIT_GAS_LIMIT_DEFAULT
            : isSteth
              ? config.WITHDRAWAL_QUEUE_REQUEST_STETH_APPROVED_GAS_LIMIT_DEFAULT
              : config.WITHDRAWAL_QUEUE_REQUEST_WSTETH_APPROVED_GAS_LIMIT_DEFAULT;
          return applyRoundUpTxParameter(
            payload ?? fallback * BigInt(requests.length),
          );
        },
        onReceipt: ({ txHashOrCallId, isAA, ctx: { stepId } }) =>
          stepId === STEP.approve
            ? txModalStages.pendingApproval(amount, token, txHashOrCallId)
            : txModalStages.pending(amount, token, txHashOrCallId, isAA),
        onSuccess: async ({ txHash, isAA, ctx: { stepId } }) => {
          if (stepId === STEP.approve) {
            trackMatomoEvent(
              MATOMO_TX_EVENTS_TYPES.withdrawalRequestApprovalFinish,
            );
            return;
          }
          if (isAA) {
            await Promise.all([onConfirm?.(), refetchAllowance()]);
            txModalStages.success(amount, token, txHash);
            return;
          }
          void onConfirm?.();
          txModalStages.success(amount, token, txHash);
          await refetchAllowance();
        },
        onMultisigDone: ({ ctx }) => {
          if (ctx.stepId === STEP.request) txModalStages.successMultisig();
        },
        onFailure: async ({ error, ctx }) => {
          console.error(error);
          // the allowance changed under the form: refresh it before a retry
          if (isStepSettled(ctx, STEP.approve)) await refetchAllowance();
          txModalStages.failed(
            detectTxFlowInterruption(error, ctx, STEP.request, [
              {
                stepId: STEP.approve,
                message: ErrorMessage.WITHDRAWAL_REQUEST_INTERRUPTED,
              },
            ]),
            onRetry,
            isSigningPermit,
            onTryAllowance,
          );
          isSigningPermit = false;
        },
      });

      // requested (or proposed to a multisig): the form resets
      return isSuccess;
    },
    [
      address,
      closeModal,
      hasBytecode,
      isBunker,
      isForceAllowance,
      onConfirm,
      onRetry,
      refetchAllowance,
      setIsForceAllowance,
      txFlow,
      txModalStages,
      withdraw.approval,
      withdraw.request,
    ],
  );

  return {
    isTokenLocked,
    isApprovalFlow,
    allowance,
    isApprovalFlowLoading,
    request,
  };
};
