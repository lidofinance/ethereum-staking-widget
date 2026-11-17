import { useMemo, useCallback } from 'react';
import invariant from 'tiny-invariant';

import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';
import { useTxModalStagesRequest } from 'features/withdrawals/request/transaction-modal-request/use-tx-modal-stages-request';

import {
  useAA,
  useDappStatus,
  useIsSmartAccount,
  useLidoSDK,
} from 'modules/web3';

import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';

import { useWithdrawalApprove } from './use-withdrawal-approve';

import { useIsForceAllowance } from '../use-is-force-allowance';

type TxModalStagesRequest = ReturnType<
  typeof useTxModalStagesRequest
>['txModalStages'];

type ProcessApproveTxArgs = {
  onRetry?: () => void;
  // the stages of the request this approval is part of, so the approval
  // shows in the same modal run as the request
  txModalStages: TxModalStagesRequest;
};

type UseWithdrawalRequestTxApproveArgs = {
  amount: bigint | null;
  token: TOKENS_TO_WITHDRAWLS;
};

export const useWithdrawalRequestTxApprove = ({
  amount,
  token,
}: UseWithdrawalRequestTxApproveArgs) => {
  const { address } = useDappStatus();
  const { withdraw } = useLidoSDK();
  const { isAA } = useAA();
  const {
    isSmartAccount,
    hasBytecode,
    isLoading: isSmartAccountLoading,
  } = useIsSmartAccount();
  const [isForceAllowance, setIsForceAllowance] = useIsForceAllowance();

  const {
    allowance,
    needsApprove,
    isLoading: isUseApproveLoading,
    refetch: refetchAllowance,
  } = useWithdrawalApprove(amount ? amount : 0n, token, address);
  const hasEnoughAllowance = !!(allowance && !needsApprove);

  // “use the classic approve-then-withdraw flow” rather than “use an ERC-2612 permit”
  const isApprovalFlow =
    isSmartAccount || hasEnoughAllowance || isForceAllowance;
  const isApprovalFlowLoading = isSmartAccountLoading || isUseApproveLoading;
  const isTokenLocked = !!(
    !isAA &&
    needsApprove &&
    (hasBytecode || isForceAllowance)
  );

  const processApproveTx = useCallback(
    async ({ onRetry, txModalStages }: ProcessApproveTxArgs) => {
      invariant(amount, 'cannot submit empty amount');
      trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalRequestApprovalStart);

      const approveTx = await withdraw.approval.approve({
        amount,
        token,
        callback: async ({ stage, payload }) => {
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
        },
      });

      // wait for refetch to settle
      await refetchAllowance().catch();

      trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalRequestApprovalFinish);

      return approveTx.hash;
    },
    [amount, refetchAllowance, token, withdraw.approval],
  );

  return useMemo(
    () => ({
      processApproveTx,
      allowance,
      needsApprove,
      refetchAllowance,
      isApprovalFlow,
      isApprovalFlowLoading,
      isTokenLocked,
      hasEnoughAllowance,
      isForceAllowance,
      setIsForceAllowance,
    }),
    [
      processApproveTx,
      allowance,
      needsApprove,
      refetchAllowance,
      isApprovalFlow,
      isApprovalFlowLoading,
      isTokenLocked,
      hasEnoughAllowance,
      isForceAllowance,
      setIsForceAllowance,
    ],
  );
};
