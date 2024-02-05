import { useMemo } from 'react';
import { useTransactionModalStage } from 'shared/transaction-modal/hooks/use-transaction-modal-stage';

import {
  TxStageFail,
  TxStageSuccessMultisig,
} from 'shared/transaction-modal/tx-stages-basic';

import { getErrorMessage } from 'utils';

export const useGeneralTransactionModalStages = () => {
  const { openTxModalStage } = useTransactionModalStage();

  const txModalStages = useMemo(
    () => ({
      successMultisig: () =>
        openTxModalStage(
          TxStageSuccessMultisig,
          {},
          {
            isClosableOnLedger: true,
          },
        ),

      failed: (error: unknown, onRetry?: () => void) =>
        openTxModalStage(
          TxStageFail,
          {
            failedText: getErrorMessage(error),
            onRetry,
          },
          {
            isClosableOnLedger: true,
          },
        ),
    }),
    [openTxModalStage],
  );

  return { txModalStages };
};
