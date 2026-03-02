import { useQuery } from '@tanstack/react-query';

import { fetchStakingApyData } from '../apy-data/staking-apy';
import { STAKING_CHART_QUERY_SCOPE } from '../consts';

export const useStakingChartData = (
  fromTimestamp: number,
  enabled: boolean,
) => {
  const result = useQuery({
    queryKey: [STAKING_CHART_QUERY_SCOPE, 'chart-data', fromTimestamp],
    queryFn: async () => {
      const data = await fetchStakingApyData(fromTimestamp);
      return data;
    },
    enabled: fromTimestamp > 0 && enabled,
  });

  return result;
};
