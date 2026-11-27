import { useMemo } from 'react';
import type { Address } from 'viem';

import {
  CHART_TIME_RANGE,
  CHART_TYPE,
  VAULT_LAUNCH_TIMESTAMP,
  type ChartTimeRange,
  type ChartType,
} from '../consts';
import {
  alignToVaultTimestamps,
  filterByRange,
  getLastPoint,
  getRangeAvailability,
  getRangeCutoffs,
  type ChartPoint,
  type LatestValues,
} from '../utils';

import { useTreasuryChartData } from './use-treasury-chart-data';
import { useStakingChartData } from './use-staking-chart-data';
import { useMetavaultChartData } from './use-vault-chart-data';

type UseChartDataProps = {
  vaultAddress?: Address;
  isUSDVault: boolean;
  isETHVault: boolean;
  activeChart: ChartType;
  activeTimeRange: ChartTimeRange;
};

export const useChartData = (props: UseChartDataProps) => {
  const { vaultAddress, isUSDVault, isETHVault, activeChart, activeTimeRange } =
    props;
  const isApyChart = activeChart === CHART_TYPE.apy;

  // Local midnight, so the ranges do not move while the page is open
  const cutoffs = useMemo(
    () => getRangeCutoffs(new Date().setHours(0, 0, 0, 0)),
    [],
  );

  // 1M and 3M use one 3M request and filter the data on the client.
  // "All" sends a request from the vault launch. It runs only when the user selects "All".
  const fromTimestampSeconds =
    activeTimeRange === CHART_TIME_RANGE.All
      ? VAULT_LAUNCH_TIMESTAMP
      : Math.floor(cutoffs['3M'] / 1000);

  const vault = useMetavaultChartData({
    fromTimestamp: fromTimestampSeconds,
    vaultAddress,
    isETHVault,
  });
  const treasury = useTreasuryChartData(
    fromTimestampSeconds,
    isApyChart && isUSDVault,
  );
  const staking = useStakingChartData(
    fromTimestampSeconds,
    isApyChart && isETHVault,
  );

  const { data, currentTvlPoint } = vault;

  const [tvlSeriesData, apySeriesData] = useMemo((): [
    ChartPoint[],
    ChartPoint[],
  ] => {
    if (!data) return [[], []];
    const toTvlPoint = (point: {
      timestampMs: number;
      tvl: number;
      tvlUsd?: number;
    }): ChartPoint =>
      point.tvlUsd != null
        ? [point.timestampMs, point.tvl, point.tvlUsd]
        : [point.timestampMs, point.tvl];

    const tvl = data.map(toTvlPoint);
    const lastTs = tvl.at(-1)?.[0] ?? 0;
    // The live TVL from the contract is newer than the last daily point
    if (currentTvlPoint && currentTvlPoint.timestampMs > lastTs) {
      tvl.push(toTvlPoint(currentTvlPoint));
    }
    return [tvl, data.map((item) => [item.timestampMs, item.apyValue])];
  }, [data, currentTvlPoint]);

  const { is3MAvailable, isAllAvailable } = useMemo(
    () =>
      getRangeAvailability({
        earliestTs:
          tvlSeriesData.length > 0
            ? Math.min(...tvlSeriesData.map(([ts]) => ts))
            : undefined,
        cutoffs,
        launchMs: VAULT_LAUNCH_TIMESTAMP * 1000,
      }),
    [tvlSeriesData, cutoffs],
  );

  const filteredTvlSeriesData = useMemo(
    () => filterByRange(tvlSeriesData, activeTimeRange, cutoffs),
    [tvlSeriesData, activeTimeRange, cutoffs],
  );
  const filteredApySeriesData = useMemo(
    () => filterByRange(apySeriesData, activeTimeRange, cutoffs),
    [apySeriesData, activeTimeRange, cutoffs],
  );

  // Align to the filtered vault series, so all lines cover the same dates
  const treasurySeriesData = useMemo(
    (): ChartPoint[] =>
      treasury.data
        ? alignToVaultTimestamps(treasury.data, filteredApySeriesData)
        : [],
    [treasury.data, filteredApySeriesData],
  );
  const stakingSeriesData = useMemo(
    (): ChartPoint[] =>
      staking.data
        ? alignToVaultTimestamps(staking.data, filteredApySeriesData)
        : [],
    [staking.data, filteredApySeriesData],
  );

  const latest = useMemo((): LatestValues => {
    const lastTvl = getLastPoint(tvlSeriesData);
    return {
      apy: getLastPoint(apySeriesData)?.[1],
      stakingApy: getLastPoint(stakingSeriesData)?.[1],
      treasuryApy: getLastPoint(treasurySeriesData)?.[1],
      tvl: lastTvl?.[1],
      tvlUsd: lastTvl?.[2],
    };
  }, [tvlSeriesData, apySeriesData, stakingSeriesData, treasurySeriesData]);

  const seriesData = isApyChart ? filteredApySeriesData : filteredTvlSeriesData;

  // Placeholder data is the previous range, so the new range is still loading
  const isVaultPending = vault.isLoading || vault.isPlaceholderData;
  const isComparisonPending =
    (isUSDVault && (treasury.isLoading || treasury.isPlaceholderData)) ||
    (isETHVault && (staking.isLoading || staking.isPlaceholderData));
  const isChartLoading = isVaultPending || (isApyChart && isComparisonPending);

  return {
    data,
    isVaultLoading: vault.isLoading,
    isChartLoading,
    isLoadingError: vault.isError,

    seriesData,
    treasurySeriesData,
    stakingSeriesData,
    latest,
    is3MAvailable,
    isAllAvailable,
  };
};
