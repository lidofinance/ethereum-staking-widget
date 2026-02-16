import { UNIX_TIMESTAMP_SCHEMA } from 'utils/zod';
import { useQuery } from '@tanstack/react-query';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { ETH_VAULT_QUERY_KEY } from '../consts';
import { ALLOCATION_SCHEMA, fetchEthVaultStats } from '../utils';
import { useEthVaultCollect } from './use-collect';

export const useEthVaultStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: [ETH_VAULT_QUERY_KEY, 'allocations'],
    queryFn: async () => {
      const fetchedData = await fetchEthVaultStats();
      const allocations = ALLOCATION_SCHEMA.parse(fetchedData.allocations);
      const lastUpdate = UNIX_TIMESTAMP_SCHEMA.parse(fetchedData.lastUpdate);
      return { allocations, lastUpdate };
    },
  });

  const { data: collectorData, isLoading: isCollectorLoading } =
    useEthVaultCollect();
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
