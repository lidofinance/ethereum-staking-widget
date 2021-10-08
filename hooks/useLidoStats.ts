import { formatEther } from '@ethersproject/units';
import { useEthPrice, useLidoSWR } from '@lido-sdk/react';
import { DATA_UNAVAILABLE } from 'config';
import { useMemo } from 'react';
import { EthplorerWrappedDataResponse } from 'types';
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
  const lidoStats = useLidoSWR<EthplorerWrappedDataResponse>(
    prependBasePath('api/lido-stats'),
    standardFetcher,
  );

  const ethPrice = useEthPrice();

  const data = useMemo(() => {
    if (lidoStats.error || ethPrice.error) {
      return {
        totalStaked: DATA_UNAVAILABLE,
        stakers: DATA_UNAVAILABLE,
        marketCap: DATA_UNAVAILABLE,
      };
    }

    if (!lidoStats.data || !lidoStats.data.data || !ethPrice.data) {
      return {
        totalStaked: DATA_UNAVAILABLE,
        stakers: DATA_UNAVAILABLE,
        marketCap: DATA_UNAVAILABLE,
      };
    }

    const totalStaked = parseFloat(
      formatEther(lidoStats.data.data.totalSupply),
    );
    const marketCap = totalStaked * ethPrice.data;

    return {
      totalStaked: `${totalStaked.toLocaleString('en-US')} ETH`,
      stakers: String(lidoStats.data.data.holdersCount),
      marketCap: `$${Math.round(marketCap).toLocaleString('en-US')}`,
    };
  }, [lidoStats, ethPrice]);

  const initialLoading = !lidoStats.data || !ethPrice.data;

  return {
    data,
    initialLoading,
  };
};
