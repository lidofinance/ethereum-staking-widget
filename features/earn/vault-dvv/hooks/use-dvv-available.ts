import { EARN_VAULT_DVV_SLUG as VAULT_NAME } from '../../consts';
import { useVaultAvailable } from 'features/earn/shared/hooks/use-vault-available';

export const useDVVAvailable = () => {
  const {
    isVaultAvailable: isDVVAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
    depositPauseReasonText,
    withdrawPauseReasonText,
  } = useVaultAvailable({ vaultName: VAULT_NAME, contractName: 'dvvVault' });

  return {
    isDVVAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
    depositPauseReasonText,
    withdrawPauseReasonText,
  };
};
