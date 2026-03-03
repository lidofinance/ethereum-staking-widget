import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { DepositTxStageSuccess } from 'modules/mellow-meta-vaults/components/deposit-tx-stage-success';
import { TOKEN_SYMBOLS, type Token, type TokenSymbol } from 'consts/tokens';

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

  signApproval: (amount: bigint, token: Token) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageApproveArgs}
        amount={amount}
        token={TOKEN_SYMBOLS[token]}
      />,
    ),

  pendingApproval: (amount: bigint, token: Token, txHash?: Hash) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageApproveArgs}
        amount={amount}
        token={TOKEN_SYMBOLS[token]}
        isPending
        txHash={txHash}
      />,
    ),

  sign: (amount: bigint, token: Token) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageOperationArgs}
        showOperationInDescription={true}
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
      <DepositTxStageSuccess
        txHash={txHash}
        amount={amount}
        token={TOKEN_SYMBOLS[token]}
      />,
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
