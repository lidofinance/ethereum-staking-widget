import { EARN_VAULT_GGV_SLUG as VAULT_NAME } from '../../consts';
import { useVaultAvailable } from 'features/earn/shared/hooks/use-vault-available';

export const useGGVAvailable = () => {
  const {
    isVaultAvailable: isGGVAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
    depositPauseReasonText,
    withdrawPauseReasonText,
  } = useVaultAvailable({ vaultName: VAULT_NAME, contractName: 'ggvVault' });

  return {
    isGGVAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
    depositPauseReasonText,
    withdrawPauseReasonText,
  };
};
