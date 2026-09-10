import { useQuery } from '@tanstack/react-query';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';
import { VaultsTvlResponse } from 'pages/api/earn/vaults-tvl';
import { API_ROUTES } from 'consts/api';

export const useEarnVaultsTvl = () => {
  const { data, isLoading } = useQuery<VaultsTvlResponse>({
    queryKey: ['earn', 'vaults-tvl'],
    ...STRATEGY_CONSTANT,
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
