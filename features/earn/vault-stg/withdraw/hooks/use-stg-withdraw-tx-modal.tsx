import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { VaultCustomTxStageSuccess } from 'features/earn/shared/vault-custom-tx-stage-success';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { FormatToken } from 'shared/formatters';

const STAGE_OPERATION_ARGS = {
  willReceiveToken: getTokenDisplayName('wstETH'),
  token: getTokenDisplayName('strETH'),
  operationText: 'requesting withdrawal for',
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

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

  success: (willReceiveWstETH: bigint, txHash?: Hash) =>
    transitStage(
      <VaultCustomTxStageSuccess
        txHash={txHash}
        title={`Withdrawal request has been sent`}
        description={
          <>
            Request to withdraw{' '}
            <FormatToken
              amount={willReceiveWstETH}
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

export const useTxModalStagesSTGWithdraw = () => {
  return useTransactionModalStage(getTxModalStagesRequest);
};
