import { Hash } from 'viem';

import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';
import { type TokenSymbol } from 'consts/tokens';

type StageOperationArgs = {
  willReceiveToken: TokenSymbol;
  token: TokenSymbol;
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
        willReceive={amount}
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
        title={
          <>
            <TxAmount
              amount={amount}
              symbol={stageOperationArgs.willReceiveToken}
            />{' '}
            has been claimed.
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

export const useTxModalStagesWithdrawClaim = (
  stageOperationArgs: StageOperationArgs,
) => {
  return useTransactionModalStage((transitStage) =>
    getTxModalStagesRequest(transitStage, stageOperationArgs),
  );
};
