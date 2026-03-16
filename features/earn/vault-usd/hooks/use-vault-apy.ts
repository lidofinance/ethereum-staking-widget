import { useQuery } from '@tanstack/react-query';
import { USD_VAULT_QUERY_SCOPE } from '../consts';
import { fetchUsdVaultStatsApr } from '../utils';

export const useUsdVaultApy = () => {
  const { data, isLoading } = useQuery({
    queryKey: [USD_VAULT_QUERY_SCOPE, 'apy'],
    queryFn: fetchUsdVaultStatsApr,
  });

  return { apy: data, isLoading } as const;
};
