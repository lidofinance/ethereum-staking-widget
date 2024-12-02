import type { Hash } from 'viem';
import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';

import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';

const STAGE_APPROVE_ARGS = {
  token: 'wstETH',
  willReceiveToken: 'wstETH',
  operationText: 'Unlocking',
};

const STAGE_OPERATION_ARGS = {
  token: 'wstETH',
  willReceiveToken: 'stETH',
  operationText: 'Unwrapping',
};

const getTxModalStagesUnwrap = (
  transitStage: TransactionModalTransitStage,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  signApproval: (amount: bigint) =>
    transitStage(
      <TxStageSignOperationAmount {...STAGE_APPROVE_ARGS} amount={amount} />,
    ),

  pendingApproval: (amount: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        isPending
        txHash={txHash}
      />,
    ),

  sign: (amount: bigint, willReceive: bigint) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        willReceive={willReceive}
      />,
    ),

  pending: (
    amount: bigint,
    willReceive: bigint,
    txHash?: Hash,
    isAA?: boolean,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        isAA={isAA}
        willReceive={willReceive}
        isPending
        txHash={txHash}
      />,
    ),

  success: (balance: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageOperationSucceedBalanceShown
        txHash={txHash}
        balance={balance}
        balanceToken={STAGE_OPERATION_ARGS.willReceiveToken}
        operationText={'Unwrapping'}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesUnwrap = () => {
  return useTransactionModalStage(getTxModalStagesUnwrap);
};
