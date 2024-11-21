import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { DATA_UNAVAILABLE } from 'consts/text';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';

type ResponseData = {
  uniqueAnytimeHolders: string;
  uniqueHolders: string;
  totalStaked: string;
  marketCap: number;
};

export const useLidoStats = (): {
  data: {
    totalStaked: string;
    stakers: string;
    marketCap: string;
  };
  isLoading: boolean;
} => {
  const url = getEthApiPath(ETH_API_ROUTES.STETH_STATS);

  const { data: rawData, isLoading } = useQuery<ResponseData>({
    queryKey: ['lido-stats', url],
    queryFn: () => standardFetcher<ResponseData>(url),
    ...STRATEGY_LAZY,
  });

  const data = useMemo(() => {
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
  }, [rawData]);

  return {
    data,
    isLoading,
  };
};
