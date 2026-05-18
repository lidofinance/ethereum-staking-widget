import { useVaultApy } from 'features/earn/shared/hooks/use-vault-apy';
import { ETH_VAULT_QUERY_SCOPE } from '../consts';
import { fetchEthVaultStatsApr } from '../utils';

export const useEthVaultApy = () => {
  return useVaultApy({
    queryScope: ETH_VAULT_QUERY_SCOPE,
    queryFn: fetchEthVaultStatsApr,
  });
};
