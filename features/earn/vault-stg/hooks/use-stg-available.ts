import { EARN_VAULT_STG_SLUG as VAULT_NAME } from '../../consts';
import { useVaultAvailable } from 'features/earn/shared/hooks/use-vault-available';

export const useSTGAvailable = () => {
  const {
    isVaultAvailable: isSTGAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
  } = useVaultAvailable({ vaultName: VAULT_NAME, contractName: 'stgVault' });

  return {
    isSTGAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
  };
};
