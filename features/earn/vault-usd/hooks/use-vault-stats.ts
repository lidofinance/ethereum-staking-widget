import { UNIX_TIMESTAMP_SCHEMA } from 'utils/zod';
import { useQuery } from '@tanstack/react-query';
import { USD_VAULT_QUERY_SCOPE } from '../consts';
import { ALLOCATION_SCHEMA, fetchUsdVaultStats } from '../utils';
import { useUsdVaultCollect } from './use-collect';
import { convertTotalUsdToNumber } from 'features/earn/shared/utils/collector-totalusd';

export const useUsdVaultStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: [USD_VAULT_QUERY_SCOPE, 'allocations'],
    queryFn: async () => {
      const fetchedData = await fetchUsdVaultStats();
      const allocations = ALLOCATION_SCHEMA.parse(fetchedData.allocations);
      const lastUpdate = UNIX_TIMESTAMP_SCHEMA.parse(fetchedData.lastUpdate);
      return { allocations, lastUpdate };
    },
  });

  const { data: collectorData, isLoading: isCollectorLoading } =
    useUsdVaultCollect();
  const totalTvlWei = collectorData?.totalTvlWei;

  const totalTvlUsd = convertTotalUsdToNumber(collectorData?.totalTvlUsd);

  return {
    isLoading: isLoading || isCollectorLoading,
    totalTvlUsd,
    totalTvlWei,
    fetchedPositions: data?.allocations,
    lastUpdateTimestamp: data?.lastUpdate,
  } as const;
};
