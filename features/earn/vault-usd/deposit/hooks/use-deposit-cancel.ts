import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import { useDepositCancel } from 'modules/mellow-meta-vaults/hooks/use-deposit-cancel';
import { useTxModalStagesDepositCancel } from 'modules/mellow-meta-vaults/hooks/use-deposit-cancel-tx-modal';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { getDepositQueueWritableContract } from '../../contracts';
import type { UsdDepositToken } from '../../types';
import { useUsdVaultDepositFormData } from './use-deposit-form-data';

export const useUsdVaultDepositCancel = (onRetry?: () => void) => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  const { refetchData } = useUsdVaultDepositFormData();

  const { txModalStages } = useTxModalStagesDepositCancel({
    stageOperationArgs: {
      operationText: 'cancelling deposit request for',
    },
  });

  return useDepositCancel<UsdDepositToken>({
    depositQueueGetter: getDepositQueueWritableContract,
    txModalStages,
    refetchTokenBalance: (token: UsdDepositToken) =>
      refetchData(TOKEN_SYMBOLS[token]),
    onRetry,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnUsdDepositCancel,
  });
};
