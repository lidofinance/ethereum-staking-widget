import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';

import { fetchMetavaultChartData } from '../apy-data/metavault-apy';
import { METAVAULT_QUERY_SCOPE } from '../consts';

export const useMetavaultChartData = (
  fromTimestamp: number,
  vaultAddress?: Address,
) => {
  const result = useQuery({
    queryKey: [
      METAVAULT_QUERY_SCOPE,
      'chart-data',
      vaultAddress,
      fromTimestamp,
    ],
    queryFn: async () => {
      if (!vaultAddress) return null;

      const fetchedData = await fetchMetavaultChartData(
        fromTimestamp,
        vaultAddress,
      );
      return fetchedData;
    },
    enabled: !!vaultAddress,
  });

  return result;
};
