import { useDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit';
import { ETH_DEPOSIT_TOKENS } from '../form-context/types';
import { getETHDepositQueueWritableContract } from '../../contracts';

export const useETHDeposit = (onRetry?: () => void) => {
  // const { txModalStages } = useTxModalStagesETHDeposit();

  return useDeposit<ETH_DEPOSIT_TOKENS>({
    depositQueueGetter: getETHDepositQueueWritableContract,
    txModalStages: {}, // TODO: update with real tx modal stages
    onRetry,
  });
};
