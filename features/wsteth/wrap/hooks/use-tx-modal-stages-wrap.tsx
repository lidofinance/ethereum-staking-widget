import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';

import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import type { BigNumber } from 'ethers';
import type { TokensWrappable } from 'features/wsteth/shared/types';

const STAGE_APPROVE_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Approving',
};

const STAGE_OPERATION_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Wrapping',
};

const getTxModalStagesWrap = (transitStage: TransactionModalTransitStage) => ({
  ...getGeneralTransactionModalStages(transitStage),

  signApproval: (amount: BigNumber, token: TokensWrappable) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
      />,
    ),

  pendingApproval: (
    amount: BigNumber,
    token: TokensWrappable,
    txHash?: string,
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

  sign: (amount: BigNumber, token: TokensWrappable, willReceive: BigNumber) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        willReceive={willReceive}
      />,
    ),

  pending: (
    amount: BigNumber,
    token: TokensWrappable,
    willReceive: BigNumber,
    txHash?: string,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        token={getTokenDisplayName(token)}
        willReceive={willReceive}
        isPending
        txHash={txHash}
      />,
    ),

  success: (balance: BigNumber, txHash?: string) =>
    transitStage(
      <TxStageOperationSucceedBalanceShown
        txHash={txHash}
        balance={balance}
        balanceToken={'wstETH'}
        operationText={'Wrapping'}
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalWrap = () => {
  return useTransactionModalStage(getTxModalStagesWrap);
};
