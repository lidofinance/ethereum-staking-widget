import { useVaultApy } from 'features/earn/shared/hooks/use-vault-apy';
import { USD_VAULT_QUERY_SCOPE } from '../consts';
import { fetchUsdVaultStatsApr } from '../utils';

export const useUsdVaultApy = () => {
  return useVaultApy({
    queryScope: USD_VAULT_QUERY_SCOPE,
    queryFn: fetchUsdVaultStatsApr,
  });
};
