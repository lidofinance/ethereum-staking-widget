import type { Hash } from 'viem';
import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';

import {
  TxStageBunker,
  TxStagePermit,
} from 'shared/transaction-modal/tx-stages-basic';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxRequestStageSuccess } from './tx-stage-request-success';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import type { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';

const STAGE_APPROVE_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Unlocking',
};

const STAGE_OPERATION_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Requesting withdrawal for',
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  dialogBunker: (): Promise<boolean> =>
    new Promise((resolve, _) => {
      transitStage(
        <TxStageBunker
          onClick={() => resolve(true)}
          onClose={() => resolve(false)}
        />,
        {
          isClosableOnLedger: true,
        },
      );
    }),

  signPermit: () => transitStage(<TxStagePermit />),

  signApproval: (amount: bigint, token: TOKENS_TO_WITHDRAWLS) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
      />,
    ),

  pendingApproval: (
    amount: bigint,
    token: TOKENS_TO_WITHDRAWLS,
    txHash?: Hash,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        isPending
        txHash={txHash}
      />,
    ),

  sign: (amount: bigint, token: TOKENS_TO_WITHDRAWLS) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
      />,
    ),

  pending: (
    amount: bigint,
    token: TOKENS_TO_WITHDRAWLS,
    txHash?: Hash,
    isAA?: boolean,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        isPending
        isAA={isAA}
        txHash={txHash}
      />,
    ),

  success: (amount: bigint, token: TOKENS_TO_WITHDRAWLS, txHash?: Hash) =>
    transitStage(
      <TxRequestStageSuccess
        amount={amount}
        tokenName={getTokenDisplayName(token)}
        txHash={txHash}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesRequest = () => {
  return useTransactionModalStage(getTxModalStagesRequest);
};
