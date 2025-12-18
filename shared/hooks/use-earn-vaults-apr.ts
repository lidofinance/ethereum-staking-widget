import { useQuery } from '@tanstack/react-query';
import { standardFetcher } from 'utils/standardFetcher';
import { VaultsAprResponse } from 'pages/api/earn/vaults-apr';

export const useEarnVaultsApr = () => {
  const ENDPOINT = '/api/earn/vaults-apr';

  const { data, isLoading } = useQuery<VaultsAprResponse>({
    queryKey: ['earn', 'vaults-apr'],
    queryFn: async () => {
      return await standardFetcher<VaultsAprResponse>(ENDPOINT);
    },
  });

  return {
    maxValue: data?.data.maxValue,
    data,
    isLoading,
  };
};
