import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';

import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { VaultDepositTxStageSuccess } from 'features/earn/shared/vault-deposit-tx-stage-success/vault-deposit-tx-stage-success';

const STAGE_APPROVE_ARGS = {
  willReceiveToken: getTokenDisplayName('wstETH'),
  token: getTokenDisplayName('dvstETH'),
  operationText: 'Unlocking',
};

const STAGE_OPERATION_ARGS = {
  willReceiveToken: getTokenDisplayName('wstETH'),
  token: getTokenDisplayName('dvstETH'),
  operationText: 'requesting withdrawal for',
};

const getTxModalStagesWithdraw = (
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
        willReceive={willReceive}
        showOperationInDescription={false}
        amount={amount}
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
        showOperationInDescription={false}
        willReceive={willReceive}
        amount={amount}
        isPending
        isAA={isAA}
        txHash={txHash}
      />,
    ),

  success: (newBalance: bigint, txHash?: Hash) =>
    transitStage(
      <VaultDepositTxStageSuccess
        txHash={txHash}
        newBalance={newBalance}
        balanceSymbol={'wstETH'}
        description={`Withdrawal operation was successful`}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesDVVWithdraw = () => {
  return useTransactionModalStage(getTxModalStagesWithdraw);
};
