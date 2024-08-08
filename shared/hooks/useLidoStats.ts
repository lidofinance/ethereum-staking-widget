import { useMemo } from 'react';
import { useLidoSWR } from '@lido-sdk/react';

import { DATA_UNAVAILABLE } from 'consts/text';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { standardFetcher } from 'utils/standardFetcher';
import { ETH_API_ROUTES, getEthApiPath } from 'consts/api';

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
  const lidoStats = useLidoSWR<ResponseData>(
    url,
    standardFetcher,
    STRATEGY_LAZY,
  );

  const data = useMemo(() => {
    return {
      totalStaked: lidoStats?.data?.totalStaked
        ? `${Number(lidoStats.data.totalStaked).toLocaleString('en-US')} ETH`
        : DATA_UNAVAILABLE,
      stakers: lidoStats?.data?.uniqueAnytimeHolders
        ? String(lidoStats.data.uniqueAnytimeHolders)
        : DATA_UNAVAILABLE,
      marketCap: lidoStats?.data?.marketCap
        ? `$${Math.round(lidoStats.data.marketCap).toLocaleString('en-US')}`
        : DATA_UNAVAILABLE,
    };
  }, [lidoStats]);

  return {
    data,
    initialLoading: lidoStats.initialLoading,
  };
};
