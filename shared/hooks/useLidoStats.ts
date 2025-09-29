import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { LOCALE } from 'config/groups/locale';

import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { DATA_UNAVAILABLE } from 'consts/text';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';

type RequestResponseData = {
  uniqueAnytimeHolders: string;
  uniqueHolders: string;
  totalStaked: string;
  marketCap: number;
};

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
    queryFn: () => {
      invariant(url, 'Missing URL for LidoStats request');
      return standardFetcher<RequestResponseData>(url);
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
    ...STRATEGY_LAZY,
  });
};
