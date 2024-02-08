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
import type { BigNumber } from 'ethers';
import type { TokensWithdrawable } from 'features/withdrawals/types/tokens-withdrawable';

const STAGE_APPROVE_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Approving',
};

const STAGE_OPERATION_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Requesting withdrawal',
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

  signApproval: (amount: BigNumber, token: TokensWithdrawable) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
      />,
    ),

  pendingApproval: (
    amount: BigNumber,
    token: TokensWithdrawable,
    txHash?: string,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        isPending={true}
        txHash={txHash}
      />,
    ),

  sign: (amount: BigNumber, token: TokensWithdrawable) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
      />,
    ),

  pending: (amount: BigNumber, token: TokensWithdrawable, txHash?: string) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        isPending={true}
        txHash={txHash}
      />,
    ),

  success: (amount: BigNumber, token: TokensWithdrawable, txHash: string) =>
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
