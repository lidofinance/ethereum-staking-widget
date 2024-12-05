import type { Hash } from 'viem';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';

import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';

import { trackMatomoEvent } from 'utils/track-matomo-event';

const STAGE_OPERATION_ARGS = {
  token: 'ETH',
  operationText: 'Claiming',
};

const getTxModalStagesClaim = (transitStage: TransactionModalTransitStage) => ({
  ...getGeneralTransactionModalStages(transitStage),

  sign: (amount: bigint) =>
    transitStage(
      <TxStageSignOperationAmount {...STAGE_OPERATION_ARGS} amount={amount} />,
    ),

  pending: (amount: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        amount={amount}
        txHash={txHash}
        isPending
      />,
    ),

  success: (amount: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageSuccess
        txHash={txHash}
        title={
          <>
            <TxAmount amount={amount} symbol="ETH" /> has been claimed
          </>
        }
        description="Claiming operation was successful"
        onClickEtherscan={() =>
          trackMatomoEvent(
            MATOMO_CLICK_EVENTS_TYPES.claimViewOnEtherscanSuccessTemplate,
          )
        }
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesClaim = () => {
  return useTransactionModalStage(getTxModalStagesClaim);
};
