import { useDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit';
import { getDepositQueueWritableContract } from '../../contracts';
import { useTxModalStagesDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit-tx-modal';
import { ETH_VAULT_TOKEN_SYMBOL } from '../../consts';
import type { EthDepositTokens } from '../../types';

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

  return useDeposit<EthDepositTokens>({
    depositQueueGetter: getDepositQueueWritableContract,
    txModalStages,
    onRetry,
  });
};
