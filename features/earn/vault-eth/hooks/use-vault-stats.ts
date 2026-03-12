import { UNIX_TIMESTAMP_SCHEMA } from 'utils/zod';
import { formatUnits } from 'viem';
import { useQuery } from '@tanstack/react-query';
// import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { ETH_VAULT_QUERY_SCOPE } from '../consts';
import { ALLOCATION_SCHEMA, fetchEthVaultStats } from '../utils';
import { useEthVaultCollect } from './use-collect';

export const useEthVaultStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: [ETH_VAULT_QUERY_SCOPE, 'allocations'],
    queryFn: async () => {
      const fetchedData = await fetchEthVaultStats();
      const allocations = ALLOCATION_SCHEMA.parse(fetchedData.allocations);
      const apiUsdTVL = Number(
        formatUnits(
          BigInt(fetchedData.totalTvl.usd),
          fetchedData.totalTvl.usd_decimals,
        ),
      );
      const lastUpdate = UNIX_TIMESTAMP_SCHEMA.parse(fetchedData.lastUpdate);

      return { allocations, lastUpdate, apiUsdTVL };
    },
  });

  const { data: collectorData, isLoading: isCollectorLoading } =
    useEthVaultCollect();
  const totalTvlWei = collectorData?.totalTvlWei;

  // Temporarily disabled: collector contract TVL (totalTvlWei × ETH price) doesn't yet
  // match the vault's actual TVL. Using the API value (apiUsdTVL) instead as
  // the source of truth until the discrepancy is resolved.
  // const { usdAmount: totalTvlUsd, isLoading: isEthUsdLoading } =
  //   useEthUsd(totalTvlWei);

  return {
    // isLoading: isLoading || isCollectorLoading || isEthUsdLoading,
    isLoading: isLoading || isCollectorLoading,
    totalTvlUsd: data?.apiUsdTVL,
    totalTvlWei,
    fetchedPositions: data?.allocations,
    lastUpdateTimestamp: data?.lastUpdate,
  } as const;
};
