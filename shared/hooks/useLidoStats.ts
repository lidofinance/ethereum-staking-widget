import { useLidoSWR } from '@lido-sdk/react';
import { DATA_UNAVAILABLE } from 'config';
import { useMemo } from 'react';
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
  const lidoStats = useLidoSWR<ResponseData>(
    prependBasePath('api/short-lido-stats'),
    standardFetcher,
  );

  const data = useMemo(() => {
    if (lidoStats.error || !lidoStats.data) {
      return {
        totalStaked: DATA_UNAVAILABLE,
        stakers: DATA_UNAVAILABLE,
        marketCap: DATA_UNAVAILABLE,
      };
    }

    return {
      totalStaked: `${Number(lidoStats.data.totalStaked).toLocaleString(
        'en-US',
      )} ETH`,
      stakers: String(lidoStats.data.uniqueAnytimeHolders),
      marketCap: `$${Math.round(lidoStats.data.marketCap).toLocaleString(
        'en-US',
      )}`,
    };
  }, [lidoStats]);

  const initialLoading = !lidoStats.data;

  return {
    data,
    initialLoading,
  };
};
