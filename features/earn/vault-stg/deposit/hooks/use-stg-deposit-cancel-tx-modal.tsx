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
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic/tx-stage-success';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';

const STAGE_OPERATION_ARGS = {
  operationText: 'cancelling deposit request for',
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

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

  success: (amount: bigint, token: TOKEN_DISPLAY_NAMES, txHash?: Hash) =>
    transitStage(
      <TxStageSuccess
        txHash={txHash}
        title={'Deposit request has been cancelled'}
        description={
          <>
            Request to deposit <TxAmount amount={amount} symbol={token} /> has
            been cancelled.
          </>
        }
        showEtherscan
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesSTGDepositCancel = () => {
  return useTransactionModalStage(getTxModalStagesRequest);
};
