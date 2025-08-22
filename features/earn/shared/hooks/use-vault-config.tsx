import { useConfig } from 'config';

export const useVaultConfig = () => {
  const vaults = useConfig().externalConfig.earnVaults;

  return {
    vaults,
  };
};
