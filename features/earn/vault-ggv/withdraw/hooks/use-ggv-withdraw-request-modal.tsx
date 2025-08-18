import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';

import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { VaultCustomTxStageSuccess } from 'features/earn/shared/vault-custom-tx-stage-success';
import { FormatToken } from 'shared/formatters';

const STAGE_APPROVE_ARGS = {
  willReceiveToken: getTokenDisplayName('wstETH'),
  token: getTokenDisplayName('gg'),
  operationText: 'Unlocking',
};

const STAGE_OPERATION_ARGS = {
  willReceiveToken: getTokenDisplayName('wstETH'),
  token: getTokenDisplayName('gg'),
  operationText: 'requesting withdrawal for',
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  signApproval: (amount: bigint) =>
    transitStage(
      <TxStageSignOperationAmount {...STAGE_APPROVE_ARGS} amount={amount} />,
    ),

  pendingApproval: (amount: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        isPending
        txHash={txHash}
      />,
    ),

  sign: (amount: bigint, willReceive: bigint) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        willReceive={willReceive}
        showOperationInDescription={false}
        amount={amount}
      />,
    ),

  pending: (
    amount: bigint,
    willReceive: bigint,
    txHash?: Hash,
    isAA?: boolean,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={false}
        willReceive={willReceive}
        amount={amount}
        isPending
        isAA={isAA}
        txHash={txHash}
      />,
    ),

  success: (willReceive: bigint, txHash?: Hash) =>
    transitStage(
      <VaultCustomTxStageSuccess
        txHash={txHash}
        title={`Withdrawal request has been sent`}
        description={
          <>
            Request to withdraw{' '}
            <FormatToken
              amount={willReceive}
              symbol={getTokenDisplayName('wstETH')}
            />{' '}
            has been sent.
          </>
        }
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesGGVWithdrawalRequest = () => {
  return useTransactionModalStage(getTxModalStagesRequest);
};
