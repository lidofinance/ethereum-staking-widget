/* eslint-disable sonarjs/no-identical-functions */
import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import type { Address, Hash } from 'viem';

import {
  TransactionCallback,
  TransactionCallbackStage,
} from '@lidofinance/lido-ethereum-sdk';

import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useTxModalStagesRequest } from 'features/withdrawals/request/transaction-modal-request/use-tx-modal-stages-request';
import { useTransactionModal } from 'shared/transaction-modal/transaction-modal';
import { useDappStatus, useIsMultisig, useLidoSDK } from 'modules/web3';

import { useWithdrawalApprove } from './use-withdrawal-approve';

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
  const { isBunker } = useWithdrawals();
  const { withdraw } = useLidoSDK();
  const { txModalStages } = useTxModalStagesRequest();
  const { isMultisig, isLoading: isMultisigLoading } = useIsMultisig();
  const {
    allowance,
    needsApprove,
    isFetching: isUseApproveFetching,
    refetch: refetchAllowance,
  } = useWithdrawalApprove(amount ? amount : 0n, token, address as Address);
  const { closeModal } = useTransactionModal();

  const isApprovalFlow = isMultisig || !!(allowance && !needsApprove);

  const isApprovalFlowLoading = isMultisigLoading || isUseApproveFetching;

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

            // Not run the 'withdraw.request.requestWithdrawal***', because we are waiting for other signatories
            if (isMultisig) return true;
          }

          await withdraw.request.requestWithdrawal(txProps);
        } else {
          await withdraw.request.requestWithdrawalWithPermit(txProps);
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
      isApprovalFlow,
      isBunker,
      isMultisig,
      needsApprove,
      onConfirm,
      onRetry,
      refetchAllowance,
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
