import { useMemo } from 'react';
import { useTransactionModalStage } from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { useGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/use-general-transaction-modal-stages';

import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import type { BigNumber } from 'ethers';
import type { TokensWrappable } from 'features/wsteth/shared/types';

const STAGE_APPROVE_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Approving',
};

const STAGE_OPERATION_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Wrapping',
};

export const useTxModalStagesWrap = () => {
  const { openTxModalStage } = useTransactionModalStage();
  const { txModalStages: generalStages } = useGeneralTransactionModalStages();

  const txModalStages = useMemo(
    () => ({
      ...generalStages,

      signApproval: (amount: BigNumber, token: TokensWrappable) =>
        openTxModalStage(TxStageSignOperationAmount, {
          ...STAGE_APPROVE_ARGS,
          amount,
          token: getTokenDisplayName(token),
        }),

      pendingApproval: (
        amount: BigNumber,
        token: TokensWrappable,
        txHash?: string,
      ) =>
        openTxModalStage(TxStageSignOperationAmount, {
          ...STAGE_APPROVE_ARGS,
          amount,
          token: getTokenDisplayName(token),
          isPending: true,
          txHash,
        }),

      sign: (
        amount: BigNumber,
        token: TokensWrappable,
        willReceive: BigNumber,
      ) =>
        openTxModalStage(TxStageSignOperationAmount, {
          ...STAGE_OPERATION_ARGS,
          amount,
          token: getTokenDisplayName(token),
          willReceive,
        }),

      pending: (
        amount: BigNumber,
        token: TokensWrappable,
        willReceive: BigNumber,
        txHash?: string,
      ) =>
        openTxModalStage(TxStageSignOperationAmount, {
          ...STAGE_OPERATION_ARGS,
          amount,
          token: getTokenDisplayName(token),
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
            operationText: 'Wrap',
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
