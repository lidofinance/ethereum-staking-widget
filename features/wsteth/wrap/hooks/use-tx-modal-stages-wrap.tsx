import type { Hash } from 'viem';
import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';

import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

const STAGE_APPROVE_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Unlocking',
};

const STAGE_OPERATION_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Wrapping',
};

const getTxModalStagesWrap = (transitStage: TransactionModalTransitStage) => ({
  ...getGeneralTransactionModalStages(transitStage),

  signApproval: (amount: bigint, token: TOKENS_TO_WRAP) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
      />,
    ),

  pendingApproval: (amount: bigint, token: TOKENS_TO_WRAP, txHash?: Hash) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        isPending
        txHash={txHash}
      />,
    ),

  sign: (amount: bigint, token: TOKENS_TO_WRAP, willReceive: bigint) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        willReceive={willReceive}
      />,
    ),

  pending: (
    amount: bigint,
    token: TOKENS_TO_WRAP,
    willReceive: bigint,
    txHash?: Hash,
    isAA?: boolean,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        willReceive={willReceive}
        isPending
        txHash={txHash}
        isAA={isAA}
      />,
    ),

  success: (balance: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageOperationSucceedBalanceShown
        txHash={txHash}
        balance={balance}
        balanceToken={'wstETH'}
        operationText={'Wrapping'}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalWrap = () => {
  return useTransactionModalStage(getTxModalStagesWrap);
};
