import { useMemo } from 'react';
import { useSDK, useLidoSWR } from '@lido-sdk/react';

import { config } from 'config';
import { DATA_UNAVAILABLE } from 'consts/text';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { prependBasePath } from 'utils';
import { standardFetcher } from 'utils/standardFetcher';

export type ResponseData = {
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
  const { chainId } = useSDK();
  const apiShortLidoStatsPath = `api/short-lido-stats?chainId=${chainId}`;
  const lidoStats = useLidoSWR<ResponseData>(
    config.ipfsMode
      ? `${config.widgetApiBasePathForIpfs}/${apiShortLidoStatsPath}`
      : prependBasePath(apiShortLidoStatsPath),
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
