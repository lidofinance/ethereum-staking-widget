import { useMemo } from 'react';
import { createAllocationsChartData } from 'features/earn/shared/vault-allocation/utils';
import { useSTGStats } from '../../hooks/use-stg-stats';
import { buildPositionsArray, categorizePositions } from '../utils';

export const useSTGAllocation = () => {
  const {
    apy,
    fetchedPositions,
    lastUpdateTimestamp,
    totalTvlUsd,
    totalTvlWei,
    isLoading,
  } = useSTGStats();

  const data = useMemo(() => {
    if (!fetchedPositions?.length || !totalTvlUsd) return;

    const categorized = categorizePositions(fetchedPositions, totalTvlUsd);
    const positions = buildPositionsArray(categorized);
    const chartData = createAllocationsChartData(positions, 100);

    return {
      chartData,
      positions,
      totalTvlUsd,
      totalTvlWei,
      lastUpdated: lastUpdateTimestamp ?? 0,
    };
  }, [fetchedPositions, totalTvlUsd, totalTvlWei, lastUpdateTimestamp]);

  return {
    data,
    isLoading,
    apy,
  };
};
