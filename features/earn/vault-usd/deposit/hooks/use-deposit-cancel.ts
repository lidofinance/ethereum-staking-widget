import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import { useDepositCancel } from 'modules/mellow-meta-vaults/hooks/use-deposit-cancel';
import { useTxModalStagesDepositCancel } from 'modules/mellow-meta-vaults/hooks/use-deposit-cancel-tx-modal';
import { getDepositQueueWritableContract } from '../../contracts';
import { UsdDepositTokens } from '../../types';
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

  return useDepositCancel<UsdDepositTokens>({
    depositQueueGetter: getDepositQueueWritableContract,
    txModalStages,
    refetchTokenBalance: refetchData,
    onRetry,
  });
};
