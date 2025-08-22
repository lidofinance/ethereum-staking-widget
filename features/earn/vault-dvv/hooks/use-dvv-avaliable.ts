import { getContractAddress } from 'config/networks/contract-address';
import { useDappStatus } from 'modules/web3';

import { useVaultConfig } from 'features/earn/shared/use-vault-config';

export const useDVVAvailable = () => {
  const { chainId } = useDappStatus();
  const { vaults } = useVaultConfig();

  return {
    isDVVAvailable: !!getContractAddress(chainId, 'dvvVault'),
    isDepositEnabled: !vaults.some(
      (vault) => vault.name === 'dvv' && vault.deposit === false,
    ),
    isWithdrawEnabled: !vaults.some(
      (vault) => vault.name === 'dvv' && vault.withdraw === false,
    ),
  };
};
