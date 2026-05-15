import { useQuery } from '@tanstack/react-query';
import { USD_VAULT_QUERY_SCOPE } from '../consts';
import { fetchUsdVaultStatsApr } from '../utils';

const APY_STALE_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

export const useUsdVaultApy = () => {
  const { data, isLoading } = useQuery({
    queryKey: [USD_VAULT_QUERY_SCOPE, 'apy'],
    queryFn: fetchUsdVaultStatsApr,
  });

  const apyUpdateTimestampMs =
    data?.apyLastUpdate != null ? data.apyLastUpdate * 1000 : undefined;

  const isApyStale =
    apyUpdateTimestampMs != null &&
    Date.now() - apyUpdateTimestampMs >= APY_STALE_THRESHOLD_MS;

  return {
    apy: data?.apy,
    apyUpdateTimestampMs,
    isApyStale,
    isLoading,
  } as const;
};
