import { useQuery } from '@tanstack/react-query';
import { standardFetcher } from 'utils/standardFetcher';
import { API_ROUTES } from 'consts/api';

export const useEarnVaultsApr = () => {
  const { data, isLoading } = useQuery<{ data: { maxValue: number } }>({
    queryKey: ['earn', 'vaults-apr'],
    queryFn: async () => {
      return await standardFetcher<{ data: { maxValue: number } }>(
        API_ROUTES.EARN_VAULTS_APR,
      );
    },
  });

  return {
    maxValue: data?.data.maxValue,
    data,
    isLoading,
  };
};
