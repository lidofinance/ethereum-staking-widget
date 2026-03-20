import { useDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit';
import { useTxModalStagesDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit-tx-modal';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { getSyncDepositQueueWritableContract } from '../../contracts';
import { USD_VAULT_TOKEN_SYMBOL } from '../../consts';
import type { UsdDepositToken } from '../../types';

export const useUsdVaultDeposit = (onRetry?: () => void) => {
  const { txModalStages } = useTxModalStagesDeposit({
    stageOperationArgs: {
      willReceiveToken: USD_VAULT_TOKEN_SYMBOL,
      operationText: 'Requesting deposit for',
    },
    stageApproveArgs: {
      willReceiveToken: USD_VAULT_TOKEN_SYMBOL,
      operationText: 'Unlocking',
    },
  });

  return useDeposit<UsdDepositToken>({
    depositQueueGetter: getSyncDepositQueueWritableContract,
    txModalStages,
    onRetry,
    matomoEventStart: MATOMO_EARN_EVENTS_TYPES.earnUsdDepositingStart,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnUsdDepositingFinish,
  });
};
