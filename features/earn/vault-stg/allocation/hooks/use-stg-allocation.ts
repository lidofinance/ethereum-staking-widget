import { useQuery } from '@tanstack/react-query';
import { createAllocationsChartData } from 'features/earn/shared/vault-allocation/utils';
import { useSTGStats } from '../../hooks/use-stg-stats';
import { buildAllocationsArray, categorizeAllocations } from '../utils';

export const useSTGAllocation = () => {
  const {
    apy,
    allocations: fetchedAllocations,
    lastUpdateTimestamp,
    totalTvlUsd: _totalTvlUsd,
    totalTvlWei: _totalTvlWei,
    isLoading: isLoadingStats,
  } = useSTGStats();

  const totalTvlUsd = _totalTvlUsd ?? 0;
  const totalTvlWei = _totalTvlWei ?? 0n;

  const allocation = useQuery({
    queryKey: ['stg', 'stats', 'allocation', fetchedAllocations],
    queryFn: async () => {
      const categorized = categorizeAllocations(
        fetchedAllocations,
        totalTvlUsd,
      );
      const allocations = buildAllocationsArray(categorized);
      const chartData = createAllocationsChartData(allocations, 100);

      return {
        chartData,
        allocations,
        totalTvlUsd,
        totalTvlWei,
        lastUpdated: lastUpdateTimestamp ?? 0,
      };
    },
  });

  return {
    ...allocation,
    isLoading: isLoadingStats || allocation.isLoading,
    apy,
  };
};
