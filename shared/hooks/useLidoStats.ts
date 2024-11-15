import { useMemo } from 'react';

import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';
import { DATA_UNAVAILABLE } from 'consts/text';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoQuery } from 'shared/hooks/use-lido-query';
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
  initialLoading: boolean;
} => {
  const url = getEthApiPath(ETH_API_ROUTES.STETH_STATS);

  const { data: rawData, initialLoading } = useLidoQuery<ResponseData>({
    queryKey: ['lido-stats', url],
    queryFn: () => standardFetcher<ResponseData>(url),
    strategy: STRATEGY_LAZY,
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
    initialLoading,
  };
};
