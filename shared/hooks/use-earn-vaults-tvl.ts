import { useQuery } from '@tanstack/react-query';
import { standardFetcher } from 'utils/standardFetcher';
import { VaultsTvlResponse } from 'pages/api/earn/vaults-tvl';
import { API_ROUTES } from 'consts/api';

export const useEarnVaultsTvl = () => {
  const { data, isLoading } = useQuery<VaultsTvlResponse>({
    queryKey: ['earn', 'vaults-tvl'],
    queryFn: async () => {
      return await standardFetcher<VaultsTvlResponse>(
        API_ROUTES.EARN_VAULTS_TVL,
      );
    },
  });

  return {
    data,
    isLoading,
  };
};
