import { useMemo } from 'react';
import { useTransactionModalStage } from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { useGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/use-general-transaction-modal-stages';

import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';

import type { BigNumber } from 'ethers';
import {
  trackMatomoEvent,
  MATOMO_CLICK_EVENTS_TYPES,
} from 'config/trackMatomoEvent';

const STAGE_OPERATION_ARGS = {
  token: 'ETH',
  operationText: 'Claiming',
};

export const useTxModalStagesClaim = () => {
  const { openTxModalStage } = useTransactionModalStage();
  const { txModalStages: generalStages } = useGeneralTransactionModalStages();

  const txModalStages = useMemo(
    () => ({
      ...generalStages,

      sign: (amount: BigNumber) =>
        openTxModalStage(TxStageSignOperationAmount, {
          ...STAGE_OPERATION_ARGS,
          amount,
        }),

      pending: (amount: BigNumber, txHash?: string) =>
        openTxModalStage(TxStageSignOperationAmount, {
          ...STAGE_OPERATION_ARGS,
          amount,
          isPending: true,
          txHash,
        }),

      success: (amount: BigNumber, txHash?: string) =>
        openTxModalStage(
          TxStageSuccess,
          {
            txHash,
            title: (
              <>
                <TxAmount amount={amount} symbol="ETH" /> has been claimed
              </>
            ),
            description: 'Claiming operation was successful',
            onClickEtherscan: () =>
              trackMatomoEvent(
                MATOMO_CLICK_EVENTS_TYPES.claimViewOnEtherscanSuccessTemplate,
              ),
          },
          {
            isClosableOnLedger: true,
          },
        ),
    }),
    [openTxModalStage, generalStages],
  );

  return { txModalStages };
};
