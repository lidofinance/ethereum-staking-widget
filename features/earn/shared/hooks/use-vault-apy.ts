import { useQuery } from '@tanstack/react-query';

const APY_STALE_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

type VaultApyData = {
  apy: number;
  apyLastUpdate: number;
};

export const useVaultApy = ({
  queryScope,
  queryFn,
}: {
  queryScope: string;
  queryFn: () => Promise<VaultApyData>;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: [queryScope, 'apy'],
    queryFn,
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
