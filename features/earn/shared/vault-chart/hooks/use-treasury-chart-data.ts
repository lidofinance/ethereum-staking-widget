import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';

import { fetchTreasuryChartData } from '../apy-data/treasury-apy';
import { TREASURY_CHART_QUERY_SCOPE } from '../consts';

export const useTreasuryChartData = (
  fromTimestamp: number,
  enabled: boolean,
) => {
  const result = useQuery({
    queryKey: [TREASURY_CHART_QUERY_SCOPE, 'chart-data', fromTimestamp],
    ...STRATEGY_CONSTANT,
    // Keep the old range on screen while a longer range loads
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const data = await fetchTreasuryChartData(fromTimestamp);
      return data;
    },
    enabled: fromTimestamp > 0 && enabled,
  });

  return result;
};
