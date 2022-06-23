import { useSDK, useLidoSWR } from '@lido-sdk/react';
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
  const { chainId } = useSDK();
  const lidoStats = useLidoSWR<ResponseData>(
    prependBasePath(`api/short-lido-stats?chainId=${chainId}`),
    standardFetcher,
  );

  const data = useMemo(() => {
    const shortStats = {
      totalStaked: DATA_UNAVAILABLE,
      stakers: DATA_UNAVAILABLE,
      marketCap: DATA_UNAVAILABLE,
    };

    if (lidoStats.error || !lidoStats.data) {
      return shortStats;
    }

    if (lidoStats.data.totalStaked) {
      shortStats.totalStaked = `${Number(
        lidoStats.data.totalStaked,
      ).toLocaleString('en-US')} ETH`;
    }

    if (lidoStats.data.uniqueAnytimeHolders) {
      shortStats.stakers = String(lidoStats.data.uniqueAnytimeHolders);
    }

    if (lidoStats.data.marketCap) {
      shortStats.marketCap = `$${Math.round(
        lidoStats.data.marketCap,
      ).toLocaleString('en-US')}`;
    }

    return shortStats;
  }, [lidoStats]);

  const initialLoading = !lidoStats.data;

  return {
    data,
    initialLoading,
  };
};
