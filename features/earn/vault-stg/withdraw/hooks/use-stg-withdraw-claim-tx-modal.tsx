import { Hash } from 'viem';

import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';

const STAGE_OPERATION_ARGS = {
  willReceiveToken: getTokenDisplayName('wstETH'),
  token: getTokenDisplayName('wstETH'),
  operationText: 'Claiming',
};

const getTxModalStagesRequest = (
  transitStage: TransactionModalTransitStage,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  sign: (amount: bigint) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        willReceive={amount}
        showOperationInDescription={false}
        amount={amount}
      />,
    ),

  pending: (amount: bigint, txHash?: Hash, isAA?: boolean) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        showOperationInDescription={false}
        amount={amount}
        isPending
        isAA={isAA}
        txHash={txHash}
      />,
    ),

  success: (amount: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageSuccess
        txHash={txHash}
        title={
          <>
            <TxAmount amount={amount} symbol={'wstETH'} /> has been claimed.
          </>
        }
        description={null}
        showEtherscan
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesSTGWithdrawClaim = () => {
  return useTransactionModalStage(getTxModalStagesRequest);
};
