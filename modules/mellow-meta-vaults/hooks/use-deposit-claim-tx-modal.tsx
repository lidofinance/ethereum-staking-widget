import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';

import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';
import { type TokenSymbol } from 'consts/tokens';
import { getTokenDecimals } from 'utils/token-decimals';

type StageArgs = {
  willReceiveToken: TokenSymbol;
  operationText: string;
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
  stageOperationArgs: StageArgs,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  sign: (amount: bigint) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageOperationArgs}
        showOperationInDescription={false}
        token={stageOperationArgs.willReceiveToken}
        amount={amount}
      />,
    ),

  pending: (amount: bigint, txHash?: Hash, isAA?: boolean) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageOperationArgs}
        showOperationInDescription={false}
        amount={amount}
        token={stageOperationArgs.willReceiveToken}
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
              decimals={getTokenDecimals(stageOperationArgs.willReceiveToken)}
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

export const useTxModalStagesDepositClaim = ({
  stageOperationArgs,
}: {
  stageOperationArgs: StageArgs;
}) => {
  return useTransactionModalStage((transitStage) =>
    getTxModalStagesRequest(transitStage, stageOperationArgs),
  );
};
