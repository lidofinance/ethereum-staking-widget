import type { Hash } from 'viem';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';

import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { VaultDepositTxStageSuccess } from 'features/earn/shared/vault-deposit-tx-stage-success';
import { GGV_TOKEN_SYMBOL } from '../../consts';

const STAGE_OPERATION_ARGS = {
  // on cancel you receive back gg
  willReceiveToken: getTokenDisplayName('gg'),
  // request is displayed in wsteth
  token: getTokenDisplayName('wstETH'),

  operationText: 'cancelling withdrawal for',
};

const getTxModalStagesCancel = (
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

  success: (newBalance?: bigint, txHash?: Hash) =>
    transitStage(
      <VaultDepositTxStageSuccess
        txHash={txHash}
        // This is wrong info but it will keep flow from exiting with error
        newBalance={newBalance ?? 0n}
        balanceSymbol={GGV_TOKEN_SYMBOL}
        description={`Withdrawal cancel was successful`}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesGGVWithdrawalCancel = () => {
  return useTransactionModalStage(getTxModalStagesCancel);
};
