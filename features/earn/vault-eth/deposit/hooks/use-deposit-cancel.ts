import { useDepositCancel } from 'modules/mellow-meta-vaults/hooks/use-deposit-cancel';
import { useTxModalStagesDepositCancel } from 'modules/mellow-meta-vaults/hooks/use-deposit-cancel-tx-modal';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { getLegacyAsyncDepositQueueWritableContract } from '../../contracts';
import { EthDepositTokenForm } from '../../types';
import { useEthVaultDepositFormData } from './use-deposit-form-data';
import type { TxRetryHandler } from 'shared/transaction-modal';

export const useEthVaultDepositCancel = (onRetry?: TxRetryHandler) => {
  const { refetchData } = useEthVaultDepositFormData();

  const { txModalStages } = useTxModalStagesDepositCancel({
    stageOperationArgs: {
      operationText: 'cancelling deposit request for',
    },
  });

  return useDepositCancel<EthDepositTokenForm>({
    depositQueueGetter: getLegacyAsyncDepositQueueWritableContract,
    txModalStages,
    refetchTokenBalance: (token: EthDepositTokenForm) =>
      refetchData(TOKEN_SYMBOLS[token]),
    onRetry,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnEthDepositCancel,
  });
};
