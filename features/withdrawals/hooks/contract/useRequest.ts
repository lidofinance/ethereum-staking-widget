import { useCallback } from 'react';
import invariant from 'tiny-invariant';

import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useTxModalStagesRequest } from 'features/withdrawals/request/transaction-modal-request/use-tx-modal-stages-request';
import { useTransactionModal } from 'shared/transaction-modal/transaction-modal';
import { useAA, useIsSmartAccount, useLidoSDK, useTxFlow } from 'modules/web3';

import { useWithdrawalRequestTxApprove } from './use-withdrawal-request-tx-approve';

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
  const { isAA } = useAA();
  const { isBunker } = useWithdrawals();
  const { withdraw } = useLidoSDK();
  const { txModalStages } = useTxModalStagesRequest();
  const txFlow = useTxFlow();
  const { hasBytecode } = useIsSmartAccount();
  const {
    allowance,
    needsApprove,
    isApprovalFlow,
    isApprovalFlowLoading,
    isTokenLocked,
    hasEnoughAllowance,
    refetchAllowance,
    processApproveTx,
    isForceAllowance,
  } = useWithdrawalRequestTxApprove({ amount, token });

  const { closeModal } = useTransactionModal();

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

        // A rare case when the connected address has bytecode (is contract) but does not support batch txs for some reason
        // or the address has enough allowance to skip approval or allowance is forced
        if (
          (!isAA && (hasBytecode || isForceAllowance)) ||
          hasEnoughAllowance
        ) {
          await txFlow({
            sendTransaction: async (txStagesCallback) => {
              if (needsApprove) {
                await processApproveTx({ onRetry });
              }
              await withdraw.request.requestWithdrawal({
                requests,
                token,
                callback: txStagesCallback,
              });
            },
            onSign: async () => {
              return txModalStages.sign(amount, token);
            },
            onReceipt: async ({ payload }) => {
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
            callsFn: async () => {
              // Approve + Withdraw batch tx
              const args = { amount, token };
              return await Promise.all([
                needsApprove && withdraw.approval.approvePopulateTx(args),
                withdraw.request.requestWithdrawalPopulateTx(args),
              ]);
            },
            sendTransaction: async (txStagesCallback) => {
              // ERC-2612 permit flow for EOAs (no batching)
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
      hasBytecode,
      hasEnoughAllowance,
      isAA,
      isApprovalFlow,
      isBunker,
      isForceAllowance,
      needsApprove,
      onConfirm,
      onRetry,
      processApproveTx,
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
