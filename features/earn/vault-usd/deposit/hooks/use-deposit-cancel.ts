import { useDepositCancel } from 'modules/mellow-meta-vaults/hooks/use-deposit-cancel';
import { useTxModalStagesDepositCancel } from 'modules/mellow-meta-vaults/hooks/use-deposit-cancel-tx-modal';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { getAsyncDepositQueueWritableContract } from '../../contracts';
import type { UsdDepositToken } from '../../types';
import { useUsdVaultDepositFormData } from './use-deposit-form-data';

// For old users who deposited before the sync queue migration
export const useUsdVaultDepositCancel = (onRetry?: () => void) => {
  const { refetchData } = useUsdVaultDepositFormData();

  const { txModalStages } = useTxModalStagesDepositCancel({
    stageOperationArgs: {
      operationText: 'cancelling deposit request for',
    },
  });

  return useDepositCancel<UsdDepositToken>({
    depositQueueGetter: getAsyncDepositQueueWritableContract,
    txModalStages,
    refetchTokenBalance: (token: UsdDepositToken) =>
      refetchData(TOKEN_SYMBOLS[token]),
    onRetry,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnUsdDepositCancel,
  });
};
