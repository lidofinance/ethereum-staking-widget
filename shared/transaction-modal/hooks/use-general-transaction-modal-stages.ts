import { useMemo } from 'react';
import { useTransactionModalStage } from 'shared/transaction-modal/hooks/use-transaction-modal-stage';

import {
  TxStageFail,
  TxStageSuccessMultisig,
} from 'shared/transaction-modal/tx-stages-basic';

import { getErrorMessage } from 'utils';
import { TX_STAGE } from 'shared/transaction-modal/types';

export const useGeneralTransactionModalStages = () => {
  const { openTxModalStage } = useTransactionModalStage();

  const txModalStages = useMemo(
    () => ({
      successMultisig: () =>
        openTxModalStage(TX_STAGE.SUCCESS_MULTISIG, TxStageSuccessMultisig, {}),

      failed: (error: unknown, onRetry?: () => void) =>
        openTxModalStage(TX_STAGE.FAIL, TxStageFail, {
          failedText: getErrorMessage(error),
          onRetry,
        }),
    }),
    [openTxModalStage],
  );

  return { txModalStages };
};
