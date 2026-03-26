import { convertTotalUsdToNumber } from 'features/earn/shared/utils/collector-totalusd';
import { unixTimestampToMs } from 'utils/unix-timestamp-to-ms';
import { useUsdVaultCollect } from './use-collect';

export const useUsdVaultStats = () => {
  const { data: collectorData, isLoading: isCollectorLoading } =
    useUsdVaultCollect();
  const totalTvlWei = collectorData?.totalTvlWei;
  const collectorTimestamp = collectorData?.collectorTimestamp; // unix timestamp in seconds

  const tvlUsd = convertTotalUsdToNumber(collectorData?.totalTvlUsd);
  const tvlUpdateTimestampMs =
    collectorTimestamp != null
      ? unixTimestampToMs(collectorTimestamp)
      : undefined;

  return {
    isLoading: isCollectorLoading,
    tvlUsd,
    tvlBaseAsset: totalTvlWei,
    tvlUpdateTimestampMs,
  } as const;
};
