import { useDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit';
import { getDepositQueueWritableContract } from '../../contracts';
import { useTxModalStagesDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit-tx-modal';
import { ETH_VAULT_TOKEN_SYMBOL } from '../../consts';
import type { EthDepositToken } from '../../types';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

export const useEthVaultDeposit = (onRetry?: () => void) => {
  const { txModalStages } = useTxModalStagesDeposit({
    stageOperationArgs: {
      willReceiveToken: ETH_VAULT_TOKEN_SYMBOL,
      operationText: 'Requesting deposit for',
    },
    stageApproveArgs: {
      willReceiveToken: ETH_VAULT_TOKEN_SYMBOL,
      operationText: 'Unlocking',
    },
  });

  return useDeposit<EthDepositToken>({
    depositQueueGetter: getDepositQueueWritableContract,
    txModalStages,
    onRetry,
    matomoEventStart: MATOMO_EARN_EVENTS_TYPES.earnEthDepositingStart,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnEthDepositingFinish,
  });
};
