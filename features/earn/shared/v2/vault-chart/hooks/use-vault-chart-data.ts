import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';
import type { Address } from 'viem';

import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { unixTimestampToMs } from 'utils/unix-timestamp-to-ms';

import { fetchMetavaultChartData } from '../apy-data/metavault-apy';
import { METAVAULT_QUERY_SCOPE } from '../consts';

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
    queryFn: async () => {
      if (!vaultAddress) return null;

      return fetchMetavaultChartData(fromTimestamp, vaultAddress);
    },
    enabled: !!vaultAddress,
  });

  // ETH price is needed to convert wei TVL to USD for ETH vaults.
  // Globally cached — adding this call causes no extra network requests.
  const { price: ethPrice, isLoading: isEthPriceLoading } = useEthUsd();

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
        apyValue: Number(item.apy.value),
      };
    });
  }, [rawData, isETHVault, ethPrice]);

  return {
    data,
    // For ETH vault, the chart is not ready until ETH price is also loaded.
    isLoading: isVaultLoading || (isETHVault && isEthPriceLoading),
    isError,
  };
};
