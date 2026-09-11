import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';
import { API_ROUTES } from 'consts/api';

// mirrors VaultsTvlResponse served by pages/api/earn/vaults-tvl
const VAULTS_TVL_RESPONSE_SCHEMA = z.object({
  data: z.record(z.string(), z.any()),
  meta: z.object({ resTimestamp: z.number() }),
});

export type VaultsTvlResponse = z.infer<typeof VAULTS_TVL_RESPONSE_SCHEMA>;

export const useEarnVaultsTvl = () => {
  const { data, isLoading } = useQuery<VaultsTvlResponse>({
    queryKey: ['earn', 'vaults-tvl'],
    ...STRATEGY_CONSTANT,
    queryFn: async () =>
      VAULTS_TVL_RESPONSE_SCHEMA.parse(
        await standardFetcher<unknown>(API_ROUTES.EARN_VAULTS_TVL),
      ),
  });

  return {
    data,
    isLoading,
  };
};
