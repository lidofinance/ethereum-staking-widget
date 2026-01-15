import { useMemo, useCallback } from 'react';
import { Address } from 'viem';
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

type useWithdrawalRequestApproveParams = {
  amount: bigint | null;
  token: TOKENS_TO_WITHDRAWLS;
};

export const useWithdrawalRequestTxApprove = ({
  amount,
  token,
}: useWithdrawalRequestApproveParams) => {
  const { address } = useDappStatus();
  const { withdraw } = useLidoSDK();
  const { txModalStages } = useTxModalStagesRequest();
  const { isAA } = useAA();
  const {
    isSmartAccount,
    hasBytecode,
    isLoading: isSmartAccountLoading,
  } = useIsSmartAccount();
  const isForceAllowance = useIsForceAllowance();

  const {
    allowance,
    needsApprove,
    isLoading: isUseApproveLoading,
    refetch: refetchAllowance,
  } = useWithdrawalApprove(amount ? amount : 0n, token, address as Address);
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
    async ({ onRetry }: { onRetry?: () => void }) => {
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
    [amount, refetchAllowance, token, txModalStages, withdraw.approval],
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
    ],
  );
};
