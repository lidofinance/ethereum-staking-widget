import { EARN_VAULT_ETH_SLUG } from '../../consts';
import { useVaultAvailable } from 'features/earn/shared/hooks/use-vault-available';

export const useEthVaultAvailable = () => {
  const {
    isVaultAvailable: isEthVaultAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
  } = useVaultAvailable({
    vaultName: EARN_VAULT_ETH_SLUG,
    contractName: 'ethVault',
  });

  return {
    isEthVaultAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
  };
};
