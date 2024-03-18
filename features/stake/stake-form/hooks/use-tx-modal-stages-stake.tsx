import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';

import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';

import type { BigNumber } from 'ethers';

const STAGE_OPERATION_ARGS = {
  token: 'ETH',
  willReceiveToken: 'stETH',
  operationText: 'Staking',
};

const getTxModalStagesStake = (transitStage: TransactionModalTransitStage) => ({
  ...getGeneralTransactionModalStages(transitStage),

  sign: (amount: BigNumber) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        willReceive={amount}
      />,
    ),

  pending: (amount: BigNumber, txHash?: string) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        willReceive={amount}
        isPending
        txHash={txHash}
      />,
    ),

  success: (balance: BigNumber, txHash?: string) =>
    transitStage(
      <TxStageOperationSucceedBalanceShown
        txHash={txHash}
        balance={balance}
        balanceToken={'stETH'}
        operationText={'Staking'}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesStake = () => {
  return useTransactionModalStage(getTxModalStagesStake);
};
