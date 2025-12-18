import { useQuery } from '@tanstack/react-query';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { UNIX_TIMESTAMP_SCHEMA, APY_SCHEMA } from 'utils/zod';
import { useSTGCollect } from './use-stg-collect';
import {
  ALLOCATION_SCHEMA,
  fetchSTGStats,
  STGStatsFetchedData,
} from '../utils';

export const useSTGStats = () => {
  const { data, isLoading } = useQuery<STGStatsFetchedData>({
    queryKey: ['stg', 'stats'],
    queryFn: async () => {
      const fetchedData = await fetchSTGStats();
      const apy = APY_SCHEMA.parse(fetchedData.apy);
      const allocations = ALLOCATION_SCHEMA.parse(fetchedData.allocations);
      const lastUpdate = UNIX_TIMESTAMP_SCHEMA.parse(fetchedData.lastUpdate);
      return { apy, allocations, lastUpdate };
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
    apy: data?.apy,
    fetchedPositions: data?.allocations,
    lastUpdateTimestamp: data?.lastUpdate,
  } as const;
};
