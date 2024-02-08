import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';

import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';

import type { BigNumber } from 'ethers';

const STAGE_OPERATION_ARGS = {
  token: 'wstETH',
  willReceiveToken: 'stETH',
  operationText: 'Unwrapping',
};

const getTxModalStagesUnwrap = (
  transitStage: TransactionModalTransitStage,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  sign: (amount: BigNumber, willReceive: BigNumber) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        willReceive={willReceive}
      />,
    ),

  pending: (amount: BigNumber, willReceive: BigNumber, txHash?: string) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        willReceive={willReceive}
        isPending={true}
        txHash={txHash}
      />,
    ),

  success: (balance: BigNumber, txHash?: string) =>
    transitStage(
      <TxStageOperationSucceedBalanceShown
        txHash={txHash}
        balance={balance}
        balanceToken={'wstETH'}
        operationText={'Unwrap'}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesUnwrap = () => {
  return useTransactionModalStage(getTxModalStagesUnwrap);
};
