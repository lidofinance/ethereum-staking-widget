import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';
import { API_ROUTES } from 'consts/api';

// mirrors VaultsAprResponse served by pages/api/earn/vaults-apr
const VAULTS_APR_RESPONSE_SCHEMA = z.object({
  data: z.object({ maxValue: z.number() }).catchall(
    z.union([
      z.number(),
      z.object({
        apr: z.number().optional(),
        timestamp: z.number().optional(),
      }),
    ]),
  ),
  meta: z.object({ resTimestamp: z.number() }),
});

export type VaultsAprResponse = z.infer<typeof VAULTS_APR_RESPONSE_SCHEMA>;

export const useEarnVaultsApr = () => {
  const { data, isLoading } = useQuery<VaultsAprResponse>({
    queryKey: ['earn', 'vaults-apr'],
    ...STRATEGY_CONSTANT,
    queryFn: async () =>
      VAULTS_APR_RESPONSE_SCHEMA.parse(
        await standardFetcher<unknown>(API_ROUTES.EARN_VAULTS_APR),
      ),
  });

  return {
    maxValue: data?.data.maxValue,
    data,
    isLoading,
  };
};
