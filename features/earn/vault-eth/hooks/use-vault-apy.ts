import { useQuery } from '@tanstack/react-query';
import { ETH_VAULT_QUERY_SCOPE } from '../consts';
import { fetchEthVaultStatsApr } from '../utils';

export const useEthVaultApy = () => {
  const { data, isLoading } = useQuery({
    queryKey: [ETH_VAULT_QUERY_SCOPE, 'apy'],
    queryFn: fetchEthVaultStatsApr,
  });

  return { apy: data, isLoading } as const;
};
