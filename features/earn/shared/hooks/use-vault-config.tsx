import { useConfig } from 'config';

export const useVaultConfig = () => {
  const vaults = useConfig().externalConfig.earnVaults;
  const enabledVaults = vaults.filter((vault) => vault.disabled !== true);

  return {
    vaults: enabledVaults,
  };
};
