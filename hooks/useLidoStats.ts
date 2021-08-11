import { formatEther } from '@ethersproject/units';
import { useLidoSWR } from '@lido-sdk/react';
import { DATA_UNAVAILABLE } from 'config';
import { useMemo } from 'react';
import { EthplorerResponse } from 'types';
import { prependBasePath } from 'utils';
import { standardFetcher } from 'utils/standardFetcher';

export const useLidoStats = (): {
  data: {
    totalStaked: string;
    stakers: string;
    marketCap: string;
  };
  initialLoading: boolean;
} => {
  const lidoStats = useLidoSWR<EthplorerResponse>(
    prependBasePath('api/lido-stats'),
    standardFetcher,
  );

  const ethPrice = useLidoSWR<string>(
    prependBasePath('api/eth-price'),
    standardFetcher,
  );

  const data = useMemo(() => {
    if (lidoStats.error || ethPrice.error) {
      return {
        totalStaked: DATA_UNAVAILABLE,
        stakers: DATA_UNAVAILABLE,
        marketCap: DATA_UNAVAILABLE,
      };
    }

    if (!lidoStats.data || !ethPrice.data) {
      return {
        totalStaked: DATA_UNAVAILABLE,
        stakers: DATA_UNAVAILABLE,
        marketCap: DATA_UNAVAILABLE,
      };
    }

    const totalStaked = parseFloat(formatEther(lidoStats.data.totalSupply));
    const marketCap = totalStaked * parseFloat(ethPrice.data);

    return {
      totalStaked: `${totalStaked.toLocaleString('en-US')} ETH`,
      stakers: String(lidoStats.data.holdersCount),
      marketCap: `$${Math.round(marketCap).toLocaleString('en-US')}`,
    };
  }, [lidoStats, ethPrice]);

  const initialLoading = !lidoStats.data || !ethPrice.data;

  return {
    data,
    initialLoading,
  };
};
