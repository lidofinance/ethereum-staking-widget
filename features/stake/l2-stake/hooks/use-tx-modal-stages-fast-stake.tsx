import type { Hash } from 'viem';
import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';

const STAGE_OPERATION_ARGS = {
  token: 'ETH',
  willReceiveToken: 'wstETH',
  operationText: 'Staking',
};

const getTxModalStagesStake = (transitStage: TransactionModalTransitStage) => ({
  ...getGeneralTransactionModalStages(transitStage),

  sign: (amount: bigint, willReceive: bigint) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        willReceive={willReceive}
      />,
    ),

  pending: (amount: bigint, txHash?: Hash, isAA?: boolean) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        isAA={isAA}
        willReceive={amount}
        isPending
        txHash={txHash}
      />,
    ),

  success: (balance: bigint, preStakeBalance: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageOperationSucceedBalanceShown
        txHash={txHash}
        balance={balance}
        balanceToken={'wstETH'}
        operationText={'Staking'}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesL2FastStake = () => {
  return useTransactionModalStage(getTxModalStagesStake);
};
