import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { FormatToken } from 'shared/formatters';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic';

const STAGE_OPERATION_ARGS = {
  willReceiveToken: getTokenDisplayName('wstETH'),
  token: getTokenDisplayName('wstETH'),
  operationText: 'requesting withdrawal for',
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
        amount={amount}
      />,
    ),

  pending: (amount: bigint, txHash?: Hash, isAA?: boolean) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={false}
        amount={amount}
        isPending
        isAA={isAA}
        txHash={txHash}
      />,
    ),

  success: (amount: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageSuccess
        txHash={txHash}
        title={'Withdrawal request has been sent'}
        showEtherscan
        description={
          <>
            Request to withdraw{' '}
            <FormatToken
              amount={amount}
              symbol={getTokenDisplayName('wstETH')}
            />{' '}
            has been sent.
          </>
        }
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesSTGWithdraw = () => {
  return useTransactionModalStage(getTxModalStagesRequest);
};
