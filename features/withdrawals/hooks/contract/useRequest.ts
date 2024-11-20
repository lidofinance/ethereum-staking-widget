/* eslint-disable sonarjs/no-identical-functions */
import { useCallback, useRef } from 'react';
import invariant from 'tiny-invariant';
import { useAccount } from 'wagmi';
import { Address } from 'viem';

import {
  TransactionCallback,
  TransactionCallbackStage,
} from '@lidofinance/lido-ethereum-sdk';

import { TOKENS_WITHDRAWABLE } from 'features/withdrawals/types/tokens-withdrawable';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useTxModalStagesRequest } from 'features/withdrawals/request/transaction-modal-request/use-tx-modal-stages-request';
import { useTransactionModal } from 'shared/transaction-modal/transaction-modal';
import { useDappStatus, useIsMultisig, useLidoSDK } from 'modules/web3';

import { overrideWithQAMockBoolean } from 'utils/qa';
import { useWithdrawalApprove } from './use-withdrawal-approve';

type useWithdrawalRequestParams = {
  amount: bigint | null;
  token: TOKENS_WITHDRAWABLE;
  onConfirm?: () => Promise<void>;
  onRetry?: () => void;
};

export const useWithdrawalRequest = ({
  amount,
  token,
  onConfirm,
  onRetry,
}: useWithdrawalRequestParams) => {
  const { connector } = useAccount();
  const { address } = useDappStatus();
  const { isBunker } = useWithdrawals();
  const { withdraw } = useLidoSDK();
  const { txModalStages } = useTxModalStagesRequest();
  const { isMultisig, isLoading: isMultisigLoading } = useIsMultisig();
  const {
    needsApprove,
    loading: loadingUseApprove,
    refetch: refetchAllowance,
  } = useWithdrawalApprove(
    amount ? amount : BigInt(0),
    token,
    address as Address,
  );
  const { closeModal } = useTransactionModal();

  // Using useRef here instead of useState to store txHash because useRef updates immediately
  // without triggering a rerender. Also, the React 18 also has issues with asynchronous state updates.
  const txHashRef = useRef<Address | undefined>(undefined);

  const isWalletConnect = overrideWithQAMockBoolean(
    connector?.id === 'walletConnect',
    'mock-qa-helpers-force-approval-withdrawal-wallet-connect',
  );

  const isApprovalFlow = Boolean(
    isWalletConnect || isMultisig || !needsApprove,
  );

  const isApprovalFlowLoading =
    isMultisigLoading || (isApprovalFlow && loadingUseApprove);

  const isTokenLocked = !!(isApprovalFlow && needsApprove);

  const request = useCallback(
    async ({
      requests,
      amount,
      token,
    }: {
      requests: bigint[] | null;
      amount: bigint | null;
      token: TOKENS_WITHDRAWABLE;
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

        const txCallbackApproval: TransactionCallback = ({
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

        const txCallback: TransactionCallback = ({ stage, payload }) => {
          switch (stage) {
            case TransactionCallbackStage.PERMIT:
              txModalStages.signPermit();
              break;
            case TransactionCallbackStage.SIGN:
              txModalStages.sign(amount, token);
              break;
            case TransactionCallbackStage.RECEIPT:
              txModalStages.pending(amount, token, payload);
              txHashRef.current = payload; // the payload here is txHash
              break;
            case TransactionCallbackStage.DONE:
              void onConfirm?.();
              txModalStages.success(amount, token, txHashRef.current);
              if (isApprovalFlow) {
                void refetchAllowance();
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
    allowance: BigInt(0),
    isApprovalFlowLoading,
    request,
  };
};
