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
          openTxModalStage(
            TxStageBunker,
            {
              onClick: () => resolve(true),
              onClose: () => resolve(false),
            },
            {
              isClosableOnLedger: true,
            },
          );
        }),

      signPermit: () => openTxModalStage(TxStagePermit, {}),

      signApproval: (amount: BigNumber, token: TokensWithdrawable) =>
        openTxModalStage(TxStageSignOperationAmount, {
          ...STAGE_APPROVE_ARGS,
          amount,
          token: getTokenDisplayName(token),
        }),

      pendingApproval: (
        amount: BigNumber,
        token: TokensWithdrawable,
        txHash?: string,
      ) =>
        openTxModalStage(TxStageSignOperationAmount, {
          ...STAGE_APPROVE_ARGS,
          amount,
          token: getTokenDisplayName(token),
          isPending: true,
          txHash,
        }),

      sign: (amount: BigNumber, token: TokensWithdrawable) =>
        openTxModalStage(TxStageSignOperationAmount, {
          ...STAGE_OPERATION_ARGS,
          amount,
          token: getTokenDisplayName(token),
        }),

      pending: (
        amount: BigNumber,
        token: TokensWithdrawable,
        txHash?: string,
      ) =>
        openTxModalStage(TxStageSignOperationAmount, {
          ...STAGE_OPERATION_ARGS,
          amount,
          token: getTokenDisplayName(token),
          isPending: true,
          txHash,
        }),

      success: (amount: BigNumber, token: TokensWithdrawable, txHash: string) =>
        openTxModalStage(
          TxRequestStageSuccess,
          {
            amount,
            tokenName: getTokenDisplayName(token),
            txHash,
          },
          {
            isClosableOnLedger: true,
          },
        ),
    }),
    [openTxModalStage, generalStages],
  );

  return { txModalStages };
};
