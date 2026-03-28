import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { unixTimestampToMs } from 'utils/unix-timestamp-to-ms';
import { useEthVaultCollect } from './use-collect';

export const useEthVaultStats = () => {
  const { data: collectorData, isLoading: isCollectorLoading } =
    useEthVaultCollect();
  const totalTvlWei = collectorData?.totalTvlWei;
  const collectorTimestamp = collectorData?.collectorTimestamp; // unix timestamp in seconds

  const { usdAmount, isLoading: isEthUsdLoading } = useEthUsd(totalTvlWei);
  const tvlUpdateTimestampMs =
    collectorTimestamp != null
      ? unixTimestampToMs(collectorTimestamp)
      : undefined;

  return {
    isLoading: isCollectorLoading || isEthUsdLoading,
    tvlUsd: usdAmount,
    tvlBaseAsset: totalTvlWei,
    tvlUpdateTimestampMs,
  } as const;
};
