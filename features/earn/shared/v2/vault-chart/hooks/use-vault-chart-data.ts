import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import type { Address } from 'viem';

import { unixTimestampToMs } from 'utils/unix-timestamp-to-ms';
import { useEthUsd } from 'shared/hooks/use-eth-usd';

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
  /** TVL in USD, only populated for ETH vaults (for the tooltip). */
  tvlUsd?: number;
  /** APY as a plain percentage (e.g. 5.25 for 5.25%). */
  apyValue: number;
};

type UseMetavaultChartDataProps = {
  fromTimestamp: number;
  vaultAddress?: Address;
  isETHVault: boolean;
  collectorTvlWei?: bigint;
};

export const useMetavaultChartData = ({
  fromTimestamp,
  vaultAddress,
  isETHVault,
  collectorTvlWei,
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

  // ETH price is used to show a USD equivalent in the TVL tooltip for ETH vaults.
  // Globally cached — no extra network requests.
  const { price: ethPrice } = useEthUsd();

  const { data: currentData, isLoading: isCurrentDataLoading } = useQuery({
    queryKey: [METAVAULT_QUERY_SCOPE, 'current-tvl-data', vaultAddress],
    queryFn: async () => {
      if (!vaultAddress) return null;
      return fetchMetavaultCurrentData(vaultAddress);
    },
    enabled: !!vaultAddress && !isETHVault,
  });

  const currentTvlPoint = useMemo(() => {
    if (isETHVault) {
      if (!collectorTvlWei) return null;
      const tvl = Number(formatUnits(collectorTvlWei, 18));
      const tvlUsd =
        ethPrice != undefined
          ? Number(
              formatUnits(
                collectorTvlWei * ethPrice.latestAnswer,
                Number(18n + ethPrice.decimals),
              ),
            )
          : undefined;
      return { timestampMs: Date.now(), tvl, tvlUsd };
    }

    if (!currentData) return null;
    const tvl = Number(
      formatUnits(
        BigInt(currentData.totalTvl.usd),
        currentData.totalTvl.usd_decimals,
      ),
    );

    return {
      timestampMs: unixTimestampToMs(currentData.lastUpdate),
      tvl,
      tvlUsd: undefined,
    };
  }, [isETHVault, currentData, collectorTvlWei, ethPrice]);

  const data = useMemo((): NormalizedVaultChartPoint[] | null => {
    if (!rawData) return null;

    return rawData.map((item) => {
      const tvl = Number(
        formatUnits(BigInt(item.tvl.amount), item.tvl.decimals),
      );
      const tvlUsd =
        isETHVault && ethPrice
          ? Number(
              formatUnits(
                BigInt(item.tvl.amount) * ethPrice.latestAnswer,
                Number(18n + ethPrice.decimals),
              ),
            )
          : undefined;

      return {
        timestampMs: unixTimestampToMs(Number(item.timestamp)),
        tvl,
        tvlUsd,
        apyValue: Number(Number(item.apy.value).toFixed(2)),
      };
    });
  }, [rawData, isETHVault, ethPrice]);

  return {
    data,
    currentTvlPoint,
    isLoading:
      isVaultLoading ||
      (isETHVault && !collectorTvlWei ? isCurrentDataLoading : false),
    isError,
  };
};
