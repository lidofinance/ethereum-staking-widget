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

type StageOperationArgs = {
  willReceiveToken: string;
  token: string;
  operationText: string;
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
  stageOperationArgs: StageOperationArgs,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  sign: (amount: bigint) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageOperationArgs}
        showOperationInDescription={false}
        amount={amount}
      />,
    ),

  pending: (amount: bigint, txHash?: Hash, isAA?: boolean) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageOperationArgs}
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

export const useTxModalStagesWithdraw = ({
  stageOperationArgs,
}: {
  stageOperationArgs: StageOperationArgs;
}) => {
  return useTransactionModalStage((transitStage) =>
    getTxModalStagesRequest(transitStage, stageOperationArgs),
  );
};
