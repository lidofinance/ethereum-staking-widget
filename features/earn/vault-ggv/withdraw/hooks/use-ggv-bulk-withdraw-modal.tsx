import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';

import { getTokenSymbol } from 'utils/get-token-symbol';
import { VaultCustomTxStageSuccess } from 'features/earn/shared/vault-custom-tx-stage-success';
import { FormatToken } from 'shared/formatters';

const STAGE_OPERATION_ARGS = {
  willReceiveToken: getTokenSymbol('WETH'),
  token: getTokenSymbol('gg'),
  operationText: 'Withdrawing',
};

const getTxModalStagesBulkWithdraw = (
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
        willReceive={willReceive}
        showOperationInDescription={false}
        amount={amount}
        isPending
        isAA={isAA}
        txHash={txHash}
      />,
    ),

  // Show the burned GG amount. The WETH amount can differ a little from the preview.
  success: (amount: bigint, txHash?: Hash) =>
    transitStage(
      <VaultCustomTxStageSuccess
        txHash={txHash}
        title="Withdrawal was successful"
        description={
          <>
            You exchanged{' '}
            <FormatToken amount={amount} symbol={getTokenSymbol('gg')} /> for{' '}
            {getTokenSymbol('WETH')}.
          </>
        }
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesGGVBulkWithdraw = () => {
  return useTransactionModalStage(getTxModalStagesBulkWithdraw);
};
