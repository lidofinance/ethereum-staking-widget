import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { STG_TOKEN_SYMBOL } from '../../consts';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';

const STAGE_OPERATION_ARGS = {
  willReceiveToken: STG_TOKEN_SYMBOL,
  operationText: 'claiming',
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  sign: (amount: bigint) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={false}
        token={getTokenDisplayName(STG_TOKEN_SYMBOL)}
        amount={amount}
      />,
    ),

  pending: (amount: bigint, txHash?: Hash, isAA?: boolean) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={false}
        amount={amount}
        token={getTokenDisplayName(STG_TOKEN_SYMBOL)}
        isPending
        isAA={isAA}
        txHash={txHash}
      />,
    ),

  success: (amount: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageSuccess
        txHash={txHash}
        title={
          <>
            <TxAmount amount={amount} symbol={STG_TOKEN_SYMBOL} /> has been
            claimed.
          </>
        }
        description={null}
        showEtherscan
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesSTGDepositClaim = () => {
  return useTransactionModalStage(getTxModalStagesRequest);
};
