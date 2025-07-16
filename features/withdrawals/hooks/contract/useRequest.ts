import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useTxModalStagesRequest } from 'features/withdrawals/request/transaction-modal-request/use-tx-modal-stages-request';
import { useTransactionModal } from 'shared/transaction-modal/transaction-modal';
import {
  useAA,
  useDappStatus,
  useIsSmartAccount,
  useLidoSDK,
  useTxFlow,
} from 'modules/web3';

import { useWithdrawalApprove } from './use-withdrawal-approve';

import type { Address } from 'viem';

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
  const { isBunker } = useWithdrawals();
  const { withdraw } = useLidoSDK();
  const { txModalStages } = useTxModalStagesRequest();
  const txFlow = useTxFlow();
  const { isSmartAccount, isLoading: isSmartAccountLoading } =
    useIsSmartAccount();
  const {
    allowance,
    needsApprove,
    isLoading: isUseApproveLoading,
    refetch: refetchAllowance,
  } = useWithdrawalApprove(amount ? amount : 0n, token, address as Address);
  const { closeModal } = useTransactionModal();

  // “use the classic approve-then-withdraw flow” rather than “use an ERC-2612 permit”
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

        const txFlowCallsFn = async () => {
          const args = { amount, token };
          return await Promise.all([
            needsApprove && withdraw.approval.approvePopulateTx(args),
            withdraw.request.requestWithdrawalPopulateTx(args),
          ]);
        };

        if (!isAA && isApprovalFlow) {
          await txFlow({
            sendTransaction: async (txStagesCallback) => {
              if (needsApprove) {
                await withdraw.approval.approve({
                  amount,
                  token,
                  callback: txStagesCallback,
                });
              }
              await withdraw.request.requestWithdrawal({
                requests,
                token,
                callback: txStagesCallback,
              });
            },
            onSign: async () => {
              if (needsApprove) {
                return txModalStages.signApproval(amount, token);
              }
              return txModalStages.sign(amount, token);
            },
            onReceipt: async ({ payload }) => {
              if (needsApprove) {
                return txModalStages.pendingApproval(amount, token, payload);
              }
              return txModalStages.pending(amount, token, payload);
            },
            onFailure: ({ error }) => {
              txModalStages.failed(error, onRetry);
            },
            onSuccess: async ({ txHash }) => {
              void onConfirm?.();
              txModalStages.success(amount, token, txHash);
              await refetchAllowance();
            },
            onMultisigDone: () => {
              txModalStages.successMultisig();
            },
          });
        } else {
          await txFlow({
            callsFn: txFlowCallsFn,
            sendTransaction: async (txStagesCallback) => {
              const deadline = BigInt(Math.floor(Date.now() / 1000) + 86_400); // 1 day
              await withdraw.request.requestWithdrawalWithPermit({
                requests,
                token,
                callback: txStagesCallback,
                deadline,
              });
            },
            onPermit: async () => {
              txModalStages.signPermit();
            },
            onSign: async () => {
              txModalStages.sign(amount, token);
            },
            onReceipt: async ({ txHashOrCallId }) => {
              txModalStages.pending(amount, token, txHashOrCallId, isAA);
            },
            onSuccess: async ({ txHash }) => {
              if (isAA) {
                await Promise.all([
                  onConfirm?.(),
                  isApprovalFlow ? refetchAllowance() : Promise.resolve(null),
                ]);
                txModalStages.success(amount, token, txHash);
              } else {
                void onConfirm?.();
                txModalStages.success(amount, token, txHash);
                if (isApprovalFlow) {
                  await refetchAllowance();
                }
              }
            },
            onFailure: ({ error }) => {
              txModalStages.failed(error, onRetry);
            },
            onMultisigDone: () => {
              txModalStages.successMultisig();
            },
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
