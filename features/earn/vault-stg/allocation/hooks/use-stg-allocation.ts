import { useMemo } from 'react';
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
    isLoading,
  } = useSTGStats();

  const totalTvlUsd = _totalTvlUsd ?? 0;
  const totalTvlWei = _totalTvlWei ?? 0n;

  const allocation = useMemo(() => {
    const categorized = categorizeAllocations(fetchedAllocations, totalTvlUsd);
    const allocations = buildAllocationsArray(categorized);
    const chartData = createAllocationsChartData(allocations, 100);

    return {
      chartData,
      allocations,
      totalTvlUsd,
      totalTvlWei,
      lastUpdated: lastUpdateTimestamp ?? 0,
    };
  }, [fetchedAllocations, totalTvlUsd, totalTvlWei, lastUpdateTimestamp]);

  return {
    allocation,
    isLoading,
    apy,
  };
};
