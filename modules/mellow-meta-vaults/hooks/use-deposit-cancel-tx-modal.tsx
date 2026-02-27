import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic/tx-stage-success';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';
import { TOKEN_SYMBOLS, type Token } from 'consts/tokens';

type StageArgs = {
  operationText: string;
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
  stageOperationArgs: StageArgs,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  sign: (amount: bigint, token: Token) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageOperationArgs}
        showOperationInDescription={false}
        token={TOKEN_SYMBOLS[token]}
        amount={amount}
      />,
    ),

  pending: (amount: bigint, token: Token, txHash?: Hash, isAA?: boolean) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageOperationArgs}
        showOperationInDescription={false}
        amount={amount}
        token={TOKEN_SYMBOLS[token]}
        isPending
        isAA={isAA}
        txHash={txHash}
      />,
    ),

  success: (amount: bigint, token: Token, txHash?: Hash) =>
    transitStage(
      <TxStageSuccess
        txHash={txHash}
        title={'Deposit request has been cancelled'}
        description={
          <>
            Request to deposit{' '}
            <TxAmount amount={amount} symbol={TOKEN_SYMBOLS[token]} /> has been
            cancelled.
          </>
        }
        showEtherscan
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesDepositCancel = ({
  stageOperationArgs,
}: {
  stageOperationArgs: StageArgs;
}) => {
  return useTransactionModalStage((transitStage) =>
    getTxModalStagesRequest(transitStage, stageOperationArgs),
  );
};
