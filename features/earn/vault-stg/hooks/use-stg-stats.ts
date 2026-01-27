import { useQuery } from '@tanstack/react-query';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { UNIX_TIMESTAMP_SCHEMA } from 'utils/zod';
import { useSTGCollect } from './use-stg-collect';
import {
  ALLOCATION_SCHEMA,
  fetchSTGStats,
  STGStatsFetchedData,
} from '../utils';

type STGStatsData = {
  allocations: STGStatsFetchedData['allocations'];
  lastUpdate: STGStatsFetchedData['lastUpdate'];
};

export const useSTGStats = () => {
  const { data, isLoading } = useQuery<STGStatsData>({
    queryKey: ['stg', 'stats'],
    queryFn: async () => {
      const fetchedData = await fetchSTGStats();
      const allocations = ALLOCATION_SCHEMA.parse(fetchedData.allocations);
      const lastUpdate = UNIX_TIMESTAMP_SCHEMA.parse(fetchedData.lastUpdate);
      return { allocations, lastUpdate };
    },
  });

  const { data: collectorData, isLoading: isCollectorLoading } =
    useSTGCollect();
  const totalTvlWei = collectorData?.totalTvlWei;

  const { usdAmount: totalTvlUsd, isLoading: isEthUsdLoading } =
    useEthUsd(totalTvlWei);

  return {
    isLoading: isLoading || isCollectorLoading || isEthUsdLoading,
    totalTvlUsd,
    totalTvlWei,
    fetchedPositions: data?.allocations,
    lastUpdateTimestamp: data?.lastUpdate,
  } as const;
};
