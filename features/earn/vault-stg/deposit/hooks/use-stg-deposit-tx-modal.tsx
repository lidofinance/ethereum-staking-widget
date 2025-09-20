import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';

import {
  getTokenDisplayName,
  TOKEN_DISPLAY_NAMES,
} from 'utils/getTokenDisplayName';
import { VaultDepositTxStageSuccess } from 'features/earn/shared/vault-deposit-tx-stage-success';
import { STG_TOKEN_SYMBOL } from '../../consts';

const STAGE_APPROVE_ARGS = {
  willReceiveToken: STG_TOKEN_SYMBOL,
  operationText: 'Unlocking',
};

const STAGE_OPERATION_ARGS = {
  willReceiveToken: STG_TOKEN_SYMBOL,
  operationText: 'depositing',
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  signApproval: (amount: bigint, token: TOKEN_DISPLAY_NAMES) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
      />,
    ),

  pendingApproval: (
    amount: bigint,
    token: TOKEN_DISPLAY_NAMES,
    txHash?: Hash,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        isPending
        txHash={txHash}
      />,
    ),

  sign: (amount: bigint, token: TOKEN_DISPLAY_NAMES) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={false}
        token={getTokenDisplayName(token)}
        amount={amount}
      />,
    ),

  pending: (
    amount: bigint,
    token: TOKEN_DISPLAY_NAMES,
    txHash?: Hash,
    isAA?: boolean,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={false}
        amount={amount}
        token={getTokenDisplayName(token)}
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
        balanceSymbol={STG_TOKEN_SYMBOL}
        description={`Depositing operation was successful`}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesSTGDeposit = () => {
  return useTransactionModalStage(getTxModalStagesRequest);
};
