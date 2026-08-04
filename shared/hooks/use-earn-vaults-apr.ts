import { useQuery } from '@tanstack/react-query';
import { standardFetcher } from 'utils/standardFetcher';
import type { VaultsAprResponse } from 'types/earn-api';
import { API_ROUTES } from 'consts/api';

export const useEarnVaultsApr = () => {
  const { data, isLoading } = useQuery<VaultsAprResponse>({
    queryKey: ['earn', 'vaults-apr'],
    queryFn: async () => {
      return await standardFetcher<VaultsAprResponse>(
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
