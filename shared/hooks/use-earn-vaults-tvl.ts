import { useQuery } from '@tanstack/react-query';
import { standardFetcher } from 'utils/standardFetcher';

import { API_ROUTES } from 'consts/api';
import { VaultsTvlResponse } from '../../infra/api/handlers/earn-vaults-tvl';

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
