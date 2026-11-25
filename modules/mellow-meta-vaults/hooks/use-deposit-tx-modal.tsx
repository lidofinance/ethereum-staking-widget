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

  signWrap: (amount: bigint, token: Token) =>
    transitStage(
      <TxStageSignOperationAmount
        operationText="Wrapping"
        willReceiveToken={TOKEN_SYMBOLS.wsteth}
        showOperationInDescription={true}
        token={TOKEN_SYMBOLS[token]}
        amount={amount}
      />,
    ),

  pendingWrap: (amount: bigint, token: Token, txHash?: Hash) =>
    transitStage(
      <TxStageSignOperationAmount
        operationText="Wrapping"
        willReceiveToken={TOKEN_SYMBOLS.wsteth}
        token={TOKEN_SYMBOLS[token]}
        amount={amount}
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

  // a deposit into an async queue is a request: it shows "request sent"
  // messaging instead of "deposit successful"
  success: (
    amount: bigint,
    token: Token,
    txHash?: Hash,
    receivedShares?: bigint,
    isAsyncQueue = false,
  ) =>
    transitStage(
      <DepositTxStageSuccess
        txHash={txHash}
        syncDeposit={
          receivedShares !== undefined
            ? {
                amount: receivedShares,
                token: stageOperationArgs.willReceiveToken,
              }
            : undefined
        }
        asyncDeposit={
          isAsyncQueue ? { amount, token: TOKEN_SYMBOLS[token] } : undefined
        }
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export type DepositTxModalStages = ReturnType<typeof getTxModalStagesRequest>;

type UseTxModalStagesDepositArgs = {
  stageOperationArgs: StageArgs;
  stageApproveArgs: StageArgs;
};

export const useTxModalStagesDeposit = ({
  stageOperationArgs,
  stageApproveArgs,
}: UseTxModalStagesDepositArgs) => {
  return useTransactionModalStage((transitStage) =>
    getTxModalStagesRequest(transitStage, stageApproveArgs, stageOperationArgs),
  );
};
