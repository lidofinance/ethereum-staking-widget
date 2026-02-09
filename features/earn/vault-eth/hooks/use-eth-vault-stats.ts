import { useQuery } from '@tanstack/react-query';

export const useETHVaultStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['earn', 'eth', 'stats'],
    queryFn: async () => {
      const allocations = {};
      const lastUpdate = {};
      return { allocations, lastUpdate };
    },
  });

  return {
    isLoading: isLoading, // || isCollectorLoading || isEthUsdLoading,
    totalTvlUsd: 0,
    totalTvlWei: 0,
    fetchedPositions: data?.allocations,
    lastUpdateTimestamp: data?.lastUpdate,
  } as const;
};
