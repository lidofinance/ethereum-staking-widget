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

const DEFAULT_STAGE_APPROVE_ARGS: StageArgs = {
  willReceiveToken: 'strETH',
  operationText: 'Claiming',
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
  stageApproveArgs: StageArgs,
  stageOperationArgs: StageArgs,
  stageClaimArgs = DEFAULT_STAGE_APPROVE_ARGS,
) => ({
  ...getGeneralTransactionModalStages(transitStage),
  // Step for stg-> earn ETH upgrade, where we claim existing deposit and then upgrade it in one flow.
  // For regular deposit flow, claim stage is not used.
  signClaim: (amount: bigint, token: Token) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageClaimArgs}
        amount={amount}
        token={TOKEN_SYMBOLS[token]}
      />,
    ),

  pendingClaim: (amount: bigint, token: Token, txHash?: Hash) =>
    transitStage(
      <TxStageSignOperationAmount
        {...stageClaimArgs}
        amount={amount}
        token={TOKEN_SYMBOLS[token]}
        isPending
        txHash={txHash}
      />,
    ),

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

type UseTxModalStagesDepositArgs = {
  stageOperationArgs: StageArgs;
  stageApproveArgs: StageArgs;
  stageClaimArgs?: StageArgs;
};

export const useTxModalStagesDeposit = ({
  stageOperationArgs,
  stageApproveArgs,
  stageClaimArgs,
}: UseTxModalStagesDepositArgs) => {
  return useTransactionModalStage((transitStage) =>
    getTxModalStagesRequest(
      transitStage,
      stageApproveArgs,
      stageOperationArgs,
      stageClaimArgs,
    ),
  );
};
