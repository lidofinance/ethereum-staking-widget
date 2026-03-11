import { useQuery } from '@tanstack/react-query';

import { fetchTreasuryChartData } from '../apy-data/treasury-apy';
import { TREASURY_CHART_QUERY_SCOPE } from '../consts';

export const useTreasuryChartData = (
  fromTimestamp: number,
  enabled: boolean,
) => {
  const result = useQuery({
    queryKey: [TREASURY_CHART_QUERY_SCOPE, 'chart-data', fromTimestamp],
    queryFn: async () => {
      const data = await fetchTreasuryChartData(fromTimestamp);
      return data;
    },
    enabled: fromTimestamp > 0 && enabled,
  });

  return result;
};
