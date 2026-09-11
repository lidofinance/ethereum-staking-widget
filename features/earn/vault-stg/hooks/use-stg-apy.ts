import { useQuery } from '@tanstack/react-query';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { fetchSTGStatsApr } from '../utils';

export const useSTGApy = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['stg', 'apy'],
    ...STRATEGY_CONSTANT,
    queryFn: fetchSTGStatsApr,
  });

  return { apy: data, isLoading } as const;
};
