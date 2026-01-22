import { useRouter } from 'next/router';

export const useUrlEnabledVaults = () => {
  // example URL param: ?enabledVaults=vault1,vault2

  const { query } = useRouter();
  let enabledVaults: string[] = [];
  if (query.enabledVaults && typeof query.enabledVaults === 'string') {
    enabledVaults = query.enabledVaults.split(',');
  }

  const isVaultEnabled = (vaultName: string) =>
    enabledVaults.includes(vaultName);
  const isVaultDisabled = (vaultName: string) => !isVaultEnabled(vaultName);

  return {
    enabledVaults,
    isVaultEnabled,
    isVaultDisabled,
  };
};
