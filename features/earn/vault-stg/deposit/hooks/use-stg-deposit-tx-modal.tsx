import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';

import { getTokenSymbol, TokenSymbol } from 'utils/get-token-symbol';
import { STG_TOKEN_SYMBOL } from '../../consts';
import { STGDepositTxStageSuccess } from '../stg-deposit-tx-stage-success';

const STAGE_APPROVE_ARGS = {
  willReceiveToken: STG_TOKEN_SYMBOL,
  operationText: 'Unlocking',
};

const STAGE_OPERATION_ARGS = {
  willReceiveToken: STG_TOKEN_SYMBOL,
  operationText: 'Requesting deposit for',
};

const getTxModalStagesRequest = (
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

  sign: (amount: bigint, token: TokenSymbol) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={true}
        token={getTokenSymbol(token)}
        amount={amount}
      />,
    ),

  pending: (
    amount: bigint,
    token: TokenSymbol,
    txHash?: Hash,
    isAA?: boolean,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={false}
        amount={amount}
        token={getTokenSymbol(token)}
        isPending
        isAA={isAA}
        txHash={txHash}
      />,
    ),

  success: (amount: bigint, token: TokenSymbol, txHash?: Hash) =>
    transitStage(
      <STGDepositTxStageSuccess
        txHash={txHash}
        amount={amount}
        token={token}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesSTGDeposit = () => {
  return useTransactionModalStage(getTxModalStagesRequest);
};
