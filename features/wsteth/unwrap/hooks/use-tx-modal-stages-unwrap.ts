import { useMemo } from 'react';
import { useTransactionModalStage } from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { useGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/use-general-transaction-modal-stages';

import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';

import type { BigNumber } from 'ethers';

const STAGE_OPERATION_ARGS = {
  token: 'wstETH',
  willReceiveToken: 'stETH',
  operationText: 'Unwrapping',
};

export const useTxModalStagesUnwrap = () => {
  const { openTxModalStage } = useTransactionModalStage();
  const { txModalStages: generalStages } = useGeneralTransactionModalStages();

  const txModalStages = useMemo(
    () => ({
      ...generalStages,

      sign: (amount: BigNumber, willReceive: BigNumber) =>
        openTxModalStage(TxStageSignOperationAmount, {
          ...STAGE_OPERATION_ARGS,
          amount,
          willReceive,
        }),

      pending: (amount: BigNumber, willReceive: BigNumber, txHash?: string) =>
        openTxModalStage(TxStageSignOperationAmount, {
          ...STAGE_OPERATION_ARGS,
          amount,
          willReceive,
          isPending: true,
          txHash,
        }),

      success: (balance: BigNumber, txHash?: string) =>
        openTxModalStage(
          TxStageOperationSucceedBalanceShown,
          {
            txHash,
            balance,
            balanceToken: 'wstETH',
            operationText: 'Unwrap',
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
