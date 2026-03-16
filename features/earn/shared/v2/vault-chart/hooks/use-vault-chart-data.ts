import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import type { Address } from 'viem';

import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { unixTimestampToMs } from 'utils/unix-timestamp-to-ms';

import {
  fetchMetavaultChartData,
  fetchMetavaultCurrentData,
} from '../apy-data/metavault-apy';
import { METAVAULT_QUERY_SCOPE } from '../consts';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

export type NormalizedVaultChartPoint = {
  timestampMs: number;
  /** TVL already converted to USD. */
  tvlUsd: number;
  /** APY as a plain percentage (e.g. 5.25 for 5.25%). */
  apyValue: number;
};

type UseMetavaultChartDataProps = {
  fromTimestamp: number;
  vaultAddress?: Address;
  isETHVault: boolean;
};

export const useMetavaultChartData = ({
  fromTimestamp,
  vaultAddress,
  isETHVault,
}: UseMetavaultChartDataProps) => {
  const {
    data: rawData,
    isLoading: isVaultLoading,
    isError,
  } = useQuery({
    queryKey: [
      METAVAULT_QUERY_SCOPE,
      'chart-data',
      vaultAddress,
      fromTimestamp,
    ],
    ...STRATEGY_LAZY,
    queryFn: async () => {
      if (!vaultAddress) return null;

      return fetchMetavaultChartData(fromTimestamp, vaultAddress);
    },
    enabled: !!vaultAddress,
  });

  // ETH price is needed to convert wei TVL to USD for ETH vaults.
  // Globally cached — adding this call causes no extra network requests.
  const { price: ethPrice, isLoading: isEthPriceLoading } = useEthUsd();

  const { data: currentData, isLoading: isCurrentDataLoading } = useQuery({
    queryKey: [METAVAULT_QUERY_SCOPE, 'current-tvl-data', vaultAddress],
    queryFn: async () => {
      if (!vaultAddress) return null;
      return fetchMetavaultCurrentData(vaultAddress);
    },
    enabled: !!vaultAddress,
  });

  const currentTvlPoint = useMemo(() => {
    if (!currentData) return null;
    return {
      timestampMs: unixTimestampToMs(currentData.lastUpdate),
      tvlUsd: Number(formatUnits(BigInt(currentData.totalTvl.usd), 8)),
    };
  }, [currentData]);

  const data = useMemo((): NormalizedVaultChartPoint[] | null => {
    if (!rawData) return null;
    // For ETH vault, hold off until ETH price is ready; otherwise tvlUsd would be wrong.
    if (isETHVault && !ethPrice) return null;

    return rawData.map((item) => {
      const tvlUsd =
        isETHVault && ethPrice
          ? Number(
              formatUnits(
                BigInt(item.tvl.amount) * ethPrice.latestAnswer,
                Number(18n + ethPrice.decimals),
              ),
            )
          : Number(formatUnits(BigInt(item.tvl.amount), item.tvl.decimals));

      return {
        timestampMs: unixTimestampToMs(Number(item.timestamp)),
        tvlUsd,
        apyValue: Number(Number(item.apy.value).toFixed(2)),
      };
    });
  }, [rawData, isETHVault, ethPrice]);

  return {
    data,
    currentTvlPoint,
    // For ETH vault, the chart is not ready until ETH price is also loaded.
    isLoading:
      isVaultLoading ||
      (isETHVault && isEthPriceLoading) ||
      isCurrentDataLoading,
    isError,
  };
};
