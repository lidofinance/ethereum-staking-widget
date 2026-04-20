import { EARN_VAULT_USD_SLUG } from '../../consts';
import { useVaultAvailable } from 'features/earn/shared/hooks/use-vault-available';

export const useUsdVaultAvailable = () => {
  const {
    isVaultAvailable: isUsdVaultAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
    depositPauseReasonText,
    withdrawPauseReasonText,
  } = useVaultAvailable({
    vaultName: EARN_VAULT_USD_SLUG,
    contractName: 'usdVault',
  });

  return {
    isUsdVaultAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
    depositPauseReasonText,
    withdrawPauseReasonText,
  };
};
