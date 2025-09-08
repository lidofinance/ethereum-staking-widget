import { useConfig } from 'config';
import { getContractAddress } from 'config/networks/contract-address';
import { useVaultConfig } from 'features/earn/shared/hooks/use-vault-config';
import { useDappStatus } from 'modules/web3';
import { EARN_PATH } from 'consts/urls';
import { NetworkConfig } from 'config/networks/networks-map';

export const useVaultAvailable = ({
  vaultName,
  contractName,
}: {
  vaultName: string;
  contractName: keyof NetworkConfig['contracts'];
}) => {
  const { pages } = useConfig().externalConfig;
  const { chainId, isSupportedChain } = useDappStatus();
  const { vaults } = useVaultConfig();

  const isEarnPageEnabled = !pages[EARN_PATH]?.shouldDisable;

  // One of the conditions for a vault to be enabled – it must be present in the vaults config
  const VaultConfig = vaults.find((vault) => vault.name === vaultName);
  const isVaultInConfig = !!VaultConfig;

  const isVaultAvailable =
    !!getContractAddress(chainId, contractName) &&
    isSupportedChain &&
    isEarnPageEnabled &&
    isVaultInConfig;

  // If the vault passes global availability checks (isVaultAvailable),
  // then deposit and withdraw features are enabled by default.
  // For disabling a feature - it must be explicitly disabled in the vault config
  const isDepositEnabled = isVaultAvailable && VaultConfig.deposit !== false;
  const isWithdrawEnabled = isVaultAvailable && VaultConfig.withdraw !== false;

  return {
    isVaultAvailable,
    isDepositEnabled,
    isWithdrawEnabled,
  };
};
