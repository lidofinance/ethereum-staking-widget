import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';

import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';

import { getTokenSymbol, TokenSymbol } from 'utils/get-token-symbol';
import { DVV_TOKEN_SYMBOL } from '../../consts';
import { VaultDepositTxStageSuccess } from 'features/earn/shared/vault-deposit-tx-stage-success';

const STAGE_APPROVE_ARGS = {
  willReceiveToken: DVV_TOKEN_SYMBOL,
  operationText: 'Unlocking',
};

const STAGE_OPERATION_ARGS = {
  willReceiveToken: DVV_TOKEN_SYMBOL,
  operationText: 'depositing',
};

const getTxModalStagesDeposit = (
  transitStage: TransactionModalTransitStage,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  signApproval: (amount: bigint, token: TokenSymbol) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenSymbol(token)}
      />,
    ),

  pendingApproval: (amount: bigint, token: TokenSymbol, txHash?: Hash) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenSymbol(token)}
        isPending
        txHash={txHash}
      />,
    ),

  sign: (amount: bigint, willReceive: bigint, token: TokenSymbol) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={false}
        token={getTokenSymbol(token)}
        amount={amount}
        willReceive={willReceive}
      />,
    ),

  pending: (
    amount: bigint,
    willReceive: bigint,
    token: TokenSymbol,
    txHash?: Hash,
    isAA?: boolean,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={false}
        willReceive={willReceive}
        amount={amount}
        token={getTokenSymbol(token)}
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
        balanceSymbol={DVV_TOKEN_SYMBOL}
        description={`Depositing operation was successful`}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesDVVDeposit = () => {
  return useTransactionModalStage(getTxModalStagesDeposit);
};
