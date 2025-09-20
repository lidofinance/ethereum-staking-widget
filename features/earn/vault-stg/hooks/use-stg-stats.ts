import { useQuery } from '@tanstack/react-query';

export const useSTGStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['stg', 'stats'],
    queryFn: async () => ({ tvl: undefined, apy: undefined }),
  });

  return {
    isLoading,
    tvl: data?.tvl,
    apy: data?.apy,
  };
};
