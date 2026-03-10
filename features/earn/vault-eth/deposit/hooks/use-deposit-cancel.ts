import invariant from 'tiny-invariant';
import { usePublicClient } from 'wagmi';
import { useDepositCancel } from 'modules/mellow-meta-vaults/hooks/use-deposit-cancel';
import { useTxModalStagesDepositCancel } from 'modules/mellow-meta-vaults/hooks/use-deposit-cancel-tx-modal';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { getDepositQueueWritableContract } from '../../contracts';
import { EthDepositTokenForm } from '../../types';
import { useEthVaultDepositFormData } from './use-deposit-form-data';

export const useEthVaultDepositCancel = (onRetry?: () => void) => {
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  const { refetchData } = useEthVaultDepositFormData();

  const { txModalStages } = useTxModalStagesDepositCancel({
    stageOperationArgs: {
      operationText: 'cancelling deposit request for',
    },
  });

  return useDepositCancel<EthDepositTokenForm>({
    depositQueueGetter: getDepositQueueWritableContract,
    txModalStages,
    refetchTokenBalance: (token: EthDepositTokenForm) =>
      refetchData(TOKEN_SYMBOLS[token]),
    onRetry,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnEthDepositCancel,
  });
};
