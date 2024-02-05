import { useMemo } from 'react';
import { useTransactionModalStage } from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { useGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/use-general-transaction-modal-stages';

import {
  TxStageBunker,
  TxStagePermit,
} from 'shared/transaction-modal/tx-stages-basic';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxRequestStageSuccess } from './tx-stage-request-success';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { TX_STAGE } from 'shared/transaction-modal/types';
import type { BigNumber } from 'ethers';
import type { TokensWithdrawable } from 'features/withdrawals/types/tokens-withdrawable';

const STAGE_APPROVE_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Approving',
};

const STAGE_OPERATION_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Requesting withdrawal',
};

export const useTxModalStagesRequest = () => {
  const { openTxModalStage } = useTransactionModalStage();
  const { txModalStages: generalStages } = useGeneralTransactionModalStages();

  const txModalStages = useMemo(
    () => ({
      ...generalStages,

      dialogBunker: (): Promise<boolean> =>
        new Promise((resolve, _) => {
          openTxModalStage(TX_STAGE.SIGN, TxStageBunker, {
            onClick: () => resolve(true),
            onClose: () => resolve(false),
          });
        }),

      signPermit: () => openTxModalStage(TX_STAGE.SIGN, TxStagePermit, {}),

      signApproval: (amount: BigNumber, token: TokensWithdrawable) =>
        openTxModalStage(TX_STAGE.SIGN, TxStageSignOperationAmount, {
          ...STAGE_APPROVE_ARGS,
          amount,
          token: getTokenDisplayName(token),
        }),

      pendingApproval: (
        amount: BigNumber,
        token: TokensWithdrawable,
        txHash?: string,
      ) =>
        openTxModalStage(TX_STAGE.BLOCK, TxStageSignOperationAmount, {
          ...STAGE_APPROVE_ARGS,
          amount,
          token: getTokenDisplayName(token),
          isPending: true,
          txHash,
        }),

      sign: (amount: BigNumber, token: TokensWithdrawable) =>
        openTxModalStage(TX_STAGE.SIGN, TxStageSignOperationAmount, {
          ...STAGE_OPERATION_ARGS,
          amount,
          token: getTokenDisplayName(token),
        }),

      pending: (
        amount: BigNumber,
        token: TokensWithdrawable,
        txHash?: string,
      ) =>
        openTxModalStage(TX_STAGE.BLOCK, TxStageSignOperationAmount, {
          ...STAGE_OPERATION_ARGS,
          amount,
          token: getTokenDisplayName(token),
          isPending: true,
          txHash,
        }),

      success: (amount: BigNumber, token: TokensWithdrawable, txHash: string) =>
        openTxModalStage(TX_STAGE.SUCCESS, TxRequestStageSuccess, {
          amount,
          tokenName: getTokenDisplayName(token),
          txHash,
        }),
    }),
    [openTxModalStage, generalStages],
  );

  return { txModalStages };
};
