import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import {
  TransactionCallback,
  TransactionCallbackStage,
} from '@lidofinance/lido-ethereum-sdk';

import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useTxModalStagesRequest } from 'features/withdrawals/request/transaction-modal-request/use-tx-modal-stages-request';
import { useTransactionModal } from 'shared/transaction-modal/transaction-modal';
import {
  useAA,
  useDappStatus,
  useIsSmartAccount,
  useLidoSDK,
  useSendAACalls,
} from 'modules/web3';

import { useWithdrawalApprove } from './use-withdrawal-approve';

import type { Address, Hash } from 'viem';

type useWithdrawalRequestParams = {
  amount: bigint | null;
  token: TOKENS_TO_WITHDRAWLS;
  onConfirm?: () => Promise<void>;
  onRetry?: () => void;
};

export const useWithdrawalRequest = ({
  amount,
  token,
  onConfirm,
  onRetry,
}: useWithdrawalRequestParams) => {
  const { address } = useDappStatus();
  const { isAA } = useAA();
  const sendAACalls = useSendAACalls();
  const { isBunker } = useWithdrawals();
  const { withdraw } = useLidoSDK();
  const { txModalStages } = useTxModalStagesRequest();
  const { isSmartAccount, isLoading: isSmartAccountLoading } =
    useIsSmartAccount();
  const {
    allowance,
    needsApprove,
    isLoading: isUseApproveLoading,
    refetch: refetchAllowance,
  } = useWithdrawalApprove(amount ? amount : 0n, token, address as Address);
  const { closeModal } = useTransactionModal();

  const isApprovalFlow = isSmartAccount || !!(allowance && !needsApprove);

  const isApprovalFlowLoading = isSmartAccountLoading || isUseApproveLoading;

  const isTokenLocked = !!(isApprovalFlow && needsApprove);

  const request = useCallback(
    async ({
      requests,
      amount,
      token,
    }: {
      requests: bigint[] | null;
      amount: bigint | null;
      token: TOKENS_TO_WITHDRAWLS;
    }) => {
      invariant(requests && request.length > 0, 'cannot submit empty requests');
      invariant(amount, 'cannot submit empty amount');

      try {
        if (isBunker) {
          const bunkerDialogResult = await txModalStages.dialogBunker();
          if (!bunkerDialogResult) {
            closeModal();
            return false;
          }
        }

        const onWithdrawalConfirm = () => {
          return Promise.all([
            onConfirm?.(),
            isApprovalFlow ? refetchAllowance() : Promise.resolve(null),
          ]);
        };

        if (isAA) {
          const calls: unknown[] = [];
          if (needsApprove) {
            const approvalCall = await withdraw.approval.approvePopulateTx({
              amount,
              token,
            });
            calls.push({
              to: approvalCall.to,
              data: approvalCall.data,
            });
          }
          const withdrawalCall =
            await withdraw.request.requestWithdrawalPopulateTx({
              token,
              amount,
            });
          calls.push({
            to: withdrawalCall.to,
            data: withdrawalCall.data,
          });

          await sendAACalls(calls, async (props) => {
            switch (props.stage) {
              case TransactionCallbackStage.SIGN:
                txModalStages.sign(amount, token);
                break;
              case TransactionCallbackStage.RECEIPT:
                txModalStages.pending(
                  amount,
                  token,
                  props.callId as Hash,
                  isAA,
                );
                break;
              case TransactionCallbackStage.DONE: {
                await onWithdrawalConfirm();
                txModalStages.success(amount, token, props.txHash);
                break;
              }
              case TransactionCallbackStage.ERROR: {
                txModalStages.failed(props.error, onRetry);
                break;
              }
              default:
                break;
            }
          });

          return true;
        }

        const txCallbackApproval: TransactionCallback = async ({
          stage,
          payload,
        }) => {
          switch (stage) {
            case TransactionCallbackStage.SIGN:
              txModalStages.signApproval(amount, token);
              break;
            case TransactionCallbackStage.RECEIPT:
              txModalStages.pendingApproval(amount, token, payload);
              break;
            case TransactionCallbackStage.MULTISIG_DONE:
              txModalStages.successMultisig();
              break;
            case TransactionCallbackStage.ERROR:
              txModalStages.failed(payload, onRetry);
              break;
            default:
          }
        };

        let txHash: Hash | undefined = undefined;
        const txCallback: TransactionCallback = async ({ stage, payload }) => {
          switch (stage) {
            case TransactionCallbackStage.PERMIT:
              txModalStages.signPermit();
              break;
            case TransactionCallbackStage.SIGN:
              txModalStages.sign(amount, token);
              break;
            case TransactionCallbackStage.RECEIPT:
              txModalStages.pending(amount, token, payload);
              // the payload here is txHash
              txHash = payload;
              break;
            case TransactionCallbackStage.DONE:
              void onConfirm?.();
              txModalStages.success(amount, token, txHash);
              if (isApprovalFlow) {
                await refetchAllowance();
              }
              break;
            case TransactionCallbackStage.MULTISIG_DONE:
              txModalStages.successMultisig();
              break;
            case TransactionCallbackStage.ERROR:
              txModalStages.failed(payload, onRetry);
              break;
            default:
          }
        };

        const txProps = {
          requests,
          token,
          callback: txCallback,
        };

        if (isApprovalFlow) {
          if (needsApprove) {
            await withdraw.approval.approve({
              amount,
              token,
              callback: txCallbackApproval,
            });
          }

          await withdraw.request.requestWithdrawal(txProps);
        } else {
          const deadline = BigInt(Math.floor(Date.now() / 1000) + 86_400); // 1 day
          await withdraw.request.requestWithdrawalWithPermit({
            ...txProps,
            deadline,
          });
        }

        return true;
      } catch (error) {
        console.error(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      closeModal,
      isAA,
      isApprovalFlow,
      isBunker,
      needsApprove,
      onConfirm,
      onRetry,
      refetchAllowance,
      sendAACalls,
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
