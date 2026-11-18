import {
  TxStageFail,
  TxStageSuccessMultisig,
} from 'shared/transaction-modal/tx-stages-basic';
import { TxStaleError } from 'modules/web3';
import { getErrorMessage, isRetryableTxError, isSettledTxError } from 'utils';
import type { TransactionModalTransitStage } from './use-transaction-modal-stage';
import type { TxRetryHandler } from '../types';

export const getGeneralTransactionModalStages = (
  transitStage: TransactionModalTransitStage,
) => ({
  successMultisig: () =>
    transitStage(<TxStageSuccessMultisig />, {
      isClosableOnLedger: true,
    }),
  failed: (error: unknown, onRetry?: TxRetryHandler) => {
    // a flow superseded before it reached the wallet: nothing to report
    if (error instanceof TxStaleError) return;
    transitStage(
      <TxStageFail
        failedText={getErrorMessage(error)}
        isSettled={isSettledTxError(error)}
        onRetry={isRetryableTxError(error) ? onRetry : undefined}
      />,
      {
        isClosableOnLedger: true,
      },
    );
  },
});
