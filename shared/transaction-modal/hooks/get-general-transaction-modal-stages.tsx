import {
  TxStageFail,
  TxStageSuccessMultisig,
} from 'shared/transaction-modal/tx-stages-basic';
import { getErrorMessage } from 'utils';
import type { TransactionModalTransitStage } from './use-transaction-modal-stage';

export const getGeneralTransactionModalStages = (
  transitStage: TransactionModalTransitStage,
) => ({
  successMultisig: () =>
    transitStage(<TxStageSuccessMultisig />, {
      isClosableOnLedger: true,
    }),
  failed: (error: unknown, onRetry?: () => void) =>
    transitStage(
      <TxStageFail failedText={getErrorMessage(error)} onRetry={onRetry} />,
      {
        isClosableOnLedger: true,
      },
    ),
});
