import { useQuery } from '@tanstack/react-query';

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
  data?: QueryResponseData | null;
  isLoading: boolean;
} => {
  const url = getEthApiPath(ETH_API_ROUTES.STETH_STATS);

  const { data, isLoading } = useQuery<
    RequestResponseData | undefined,
    Error,
    QueryResponseData | null
  >({
    queryKey: ['lido-stats', url],
    enabled: !!url,
    queryFn: () => {
      if (!url) {
        throw new Error('Missing URL for curve LidoStats request');
      }
      return standardFetcher<RequestResponseData>(url);
    },
    select: (rawData) => {
      if (!rawData) {
        return null;
      }

      return {
        totalStaked: rawData?.totalStaked
          ? `${Number(rawData.totalStaked).toLocaleString('en-US')} ETH`
          : DATA_UNAVAILABLE,
        stakers: rawData?.uniqueAnytimeHolders
          ? String(rawData.uniqueAnytimeHolders)
          : DATA_UNAVAILABLE,
        marketCap: rawData?.marketCap
          ? `$${Math.round(rawData.marketCap).toLocaleString('en-US')}`
          : DATA_UNAVAILABLE,
      };
    },
    ...STRATEGY_LAZY,
  });

  return {
    data,
    isLoading,
  };
};
