import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { VaultCustomTxStageSuccess } from 'features/earn/shared/vault-custom-tx-stage-success';

import {
  getTokenDisplayName,
  TOKEN_DISPLAY_NAMES,
} from 'utils/getTokenDisplayName';
import { STG_TOKEN_SYMBOL } from '../../consts';

const STAGE_OPERATION_ARGS = {
  willReceiveToken: STG_TOKEN_SYMBOL,
  operationText: 'claiming',
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  sign: (amount: bigint, token: TOKEN_DISPLAY_NAMES) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={false}
        token={getTokenDisplayName(token)}
        amount={amount}
      />,
    ),

  pending: (
    amount: bigint,
    token: TOKEN_DISPLAY_NAMES,
    txHash?: Hash,
    isAA?: boolean,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={false}
        amount={amount}
        token={getTokenDisplayName(token)}
        isPending
        isAA={isAA}
        txHash={txHash}
      />,
    ),

  success: (_amount: bigint, txHash?: Hash) =>
    transitStage(
      <VaultCustomTxStageSuccess
        title={'Successfully claimed'}
        txHash={txHash}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesSTGDepositClaim = () => {
  return useTransactionModalStage(getTxModalStagesRequest);
};
