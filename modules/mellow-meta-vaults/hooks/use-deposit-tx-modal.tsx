import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { DepositTxStageSuccess } from 'modules/mellow-meta-vaults/components/deposit-tx-stage-success';
import { type TokenSymbol } from 'consts/tokens';

type StageArgs = {
  willReceiveToken: TokenSymbol;
  operationText: string;
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
  stageApproveArgs: StageArgs,
  stageOperationArgs: StageArgs,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  signApproval: (amount: bigint, token: TokenSymbol) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageApproveArgs}
        amount={amount}
        token={getTokenDisplayName(token)}
      />,
    ),

  pendingApproval: (amount: bigint, token: TokenSymbol, txHash?: Hash) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageApproveArgs}
        amount={amount}
        token={getTokenDisplayName(token)}
        isPending
        txHash={txHash}
      />,
    ),

  sign: (amount: bigint, token: TokenSymbol) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageOperationArgs}
        showOperationInDescription={true}
        token={getTokenDisplayName(token)}
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
        {...stageOperationArgs}
        showOperationInDescription={false}
        amount={amount}
        token={getTokenDisplayName(token)}
        isPending
        isAA={isAA}
        txHash={txHash}
      />,
    ),

  success: (amount: bigint, token: TokenSymbol, txHash?: Hash) =>
    transitStage(
      <DepositTxStageSuccess txHash={txHash} amount={amount} token={token} />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesDeposit = ({
  stageOperationArgs,
  stageApproveArgs,
}: {
  stageOperationArgs: StageArgs;
  stageApproveArgs: StageArgs;
}) => {
  return useTransactionModalStage((transitStage) =>
    getTxModalStagesRequest(transitStage, stageApproveArgs, stageOperationArgs),
  );
};
