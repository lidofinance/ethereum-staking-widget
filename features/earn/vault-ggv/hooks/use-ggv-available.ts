import { getContractAddress } from 'config/networks/contract-address';
import { useDappStatus } from 'modules/web3';

import { useVaultConfig } from 'features/earn/shared/hooks/use-vault-config';

export const useGGVAvailable = () => {
  const { chainId } = useDappStatus();
  const { vaults } = useVaultConfig();

  return {
    isGGVAvailable: !!getContractAddress(chainId, 'ggvVault'),
    isDepositEnabled: !vaults.some(
      (vault) => vault.name === 'ggv' && vault.deposit === false,
    ),
    isWithdrawEnabled: !vaults.some(
      (vault) => vault.name === 'ggv' && vault.withdraw === false,
    ),
  };
};
