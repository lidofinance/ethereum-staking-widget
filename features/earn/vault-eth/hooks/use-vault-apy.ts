import { useQuery } from '@tanstack/react-query';
import { ETH_VAULT_QUERY_KEY } from '../consts';
import { fetchEthVaultStatsApr } from '../utils';

export const useEthVaultApy = () => {
  const { data, isLoading } = useQuery({
    queryKey: [ETH_VAULT_QUERY_KEY, 'apy'],
    queryFn: fetchEthVaultStatsApr,
  });

  return { apy: data, isLoading } as const;
};
