import { useQuery } from '@tanstack/react-query';
import { fetchSTGStatsApr } from '../utils';

export const useSTGApy = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['stg', 'apy'],
    queryFn: fetchSTGStatsApr,
  });

  return { apy: data, isLoading } as const;
};
