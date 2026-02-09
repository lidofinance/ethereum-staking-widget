import { EARN_VAULT_STG_SLUG as VAULT_NAME } from '../../consts';
import { useVaultAvailable } from 'features/earn/shared/hooks/use-vault-available';

export const useETHAvailable = () => {
  const {
    isVaultAvailable: isETHAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
  } = useVaultAvailable({ vaultName: VAULT_NAME, contractName: 'ethVault' });

  return {
    isETHAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
  };
};
