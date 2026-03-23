import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import type { Address } from 'viem';

import { unixTimestampToMs } from 'utils/unix-timestamp-to-ms';

import {
  fetchMetavaultChartData,
  fetchMetavaultCurrentData,
} from '../apy-data/metavault-apy';
import { METAVAULT_QUERY_SCOPE } from '../consts';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

export type NormalizedVaultChartPoint = {
  timestampMs: number;
  /** TVL: ETH for ETH vaults, USD for USD vaults. */
  tvl: number;
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
    const tvl = isETHVault
      ? Number(
          formatUnits(
            BigInt(currentData.totalTvl.amount),
            currentData.totalTvl.decimals,
          ),
        )
      : Number(formatUnits(BigInt(currentData.totalTvl.usd), 8));
    return {
      timestampMs: unixTimestampToMs(currentData.lastUpdate),
      tvl,
    };
  }, [currentData, isETHVault]);

  const data = useMemo((): NormalizedVaultChartPoint[] | null => {
    if (!rawData) return null;

    return rawData.map((item) => {
      const tvl = Number(formatUnits(BigInt(item.tvl.amount), item.tvl.decimals));

      return {
        timestampMs: unixTimestampToMs(Number(item.timestamp)),
        tvl,
        apyValue: Number(Number(item.apy.value).toFixed(2)),
      };
    });
  }, [rawData]);

  return {
    data,
    currentTvlPoint,
    isLoading: isVaultLoading || isCurrentDataLoading,
    isError,
  };
};
