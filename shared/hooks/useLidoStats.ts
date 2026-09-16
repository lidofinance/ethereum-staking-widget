import invariant from 'tiny-invariant';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { LOCALE } from 'config/groups/locale';

import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { DATA_UNAVAILABLE } from 'consts/text';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';

// fields are optional: `select` shows DATA_UNAVAILABLE for whatever is missing
const LIDO_STATS_SCHEMA = z.object({
  uniqueAnytimeHolders: z.string().optional(),
  totalStaked: z.string().optional(),
  marketCap: z.number().optional(),
});

type RequestResponseData = z.infer<typeof LIDO_STATS_SCHEMA>;

type QueryResponseData = {
  totalStaked: string;
  stakers: string;
  marketCap: string;
};

export const useLidoStats = (): {
  data?: QueryResponseData;
  isLoading: boolean;
} => {
  const url = getEthApiPath(ETH_API_ROUTES.STETH_STATS);

  return useQuery<RequestResponseData, Error, QueryResponseData>({
    queryKey: ['lido-stats', url],
    enabled: !!url,
    queryFn: async () => {
      invariant(url, 'Missing URL for LidoStats request');
      return LIDO_STATS_SCHEMA.parse(await standardFetcher<unknown>(url));
    },
    select: (rawData) => {
      invariant(rawData, 'Failed to fetch LidoStats');

      return {
        totalStaked: rawData?.totalStaked
          ? `${Number(rawData.totalStaked).toLocaleString(LOCALE)} ETH`
          : DATA_UNAVAILABLE,
        stakers: rawData?.uniqueAnytimeHolders
          ? Number(rawData.uniqueAnytimeHolders).toLocaleString(LOCALE)
          : DATA_UNAVAILABLE,
        marketCap: rawData?.marketCap
          ? `$${Math.round(rawData.marketCap).toLocaleString(LOCALE)}`
          : DATA_UNAVAILABLE,
      };
    },
    ...STRATEGY_CONSTANT,
  });
};
