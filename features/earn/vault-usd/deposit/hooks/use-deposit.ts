import { useDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit';
import { useTxModalStagesDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit-tx-modal';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { TOKENS } from 'consts/tokens';
import { getDepositQueueWritableContract } from '../../contracts';
import { USD_VAULT_TOKEN_SYMBOL } from '../../consts';
import type { UsdDepositToken } from '../../types';

export const useUsdVaultDeposit = (onRetry?: () => void) => {
  const { txModalStages } = useTxModalStagesDeposit({
    stageOperationArgs: {
      willReceiveToken: USD_VAULT_TOKEN_SYMBOL,
      operationText: 'Requesting deposit for',
      isAsyncQueueToken: (token) => token === TOKENS.usde,
    },
    stageApproveArgs: {
      willReceiveToken: USD_VAULT_TOKEN_SYMBOL,
      operationText: 'Unlocking',
    },
  });

  return useDeposit<UsdDepositToken>({
    depositQueueGetter: getDepositQueueWritableContract,
    txModalStages,
    onRetry,
    matomoEventStart: MATOMO_EARN_EVENTS_TYPES.earnUsdDepositingStart,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnUsdDepositingFinish,
  });
};
