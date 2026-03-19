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

  success: (
    _amount: bigint,
    _token: Token,
    txHash?: Hash,
    receivedShares?: bigint,
  ) =>
    transitStage(
      <DepositTxStageSuccess
        txHash={txHash}
        receivedShares={receivedShares}
        willReceiveToken={stageOperationArgs.willReceiveToken}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

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
