import { useDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit';
import { getDepositQueueWritableContract } from '../../contracts';
import { useTxModalStagesDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit-tx-modal';
import { USD_VAULT_TOKEN_SYMBOL } from '../../consts';
import type { UsdDepositTokens } from '../../types';

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

  return useDeposit<UsdDepositTokens>({
    depositQueueGetter: getDepositQueueWritableContract,
    txModalStages,
    onRetry,
  });
};
