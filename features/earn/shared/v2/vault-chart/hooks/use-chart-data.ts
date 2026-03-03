import { useMemo, useRef, useEffect } from 'react';
import type { TooltipComponentFormatterCallbackParams } from 'echarts';
import type { Address } from 'viem';
import * as echarts from 'echarts/core';

import { unixTimestampToMs } from 'utils/unix-timestamp-to-ms';

import {
  formatTvl,
  formatTooltipContent,
  alignToVaultTimestamps,
} from '../utils';
import { SECONDS_PER_DAY, DAYS_BY_RANGE } from '../consts';
import {
  CHART_TIME_RANGE,
  ChartTimeRange,
  ChartType,
  CHART_TYPE,
} from '../vault-chart-controls';

import { useTreasuryChartData } from './use-treasury-chart-data';
import { useStakingChartData } from './use-staking-chart-data';
import { useMetavaultChartData } from './use-vault-chart-data';

const DEFAULT_DECIMALS = 18;

type UseChartDataProps = {
  fromTimestampSeconds: number;
  vaultAddress?: Address;
  isUSDVault: boolean;
  isETHVault: boolean;
  activeChart: ChartType;
  activeTimeRange: ChartTimeRange;
};

export const useChartData = (props: UseChartDataProps) => {
  const {
    fromTimestampSeconds,
    vaultAddress,
    isUSDVault,
    isETHVault,
    activeChart,
    activeTimeRange,
  } = props;

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  const {
    data,
    isLoading: isVaultLoading,
    isError,
  } = useMetavaultChartData(fromTimestampSeconds, vaultAddress);
  const { data: treasuryData, isLoading: isTreasuryLoading } =
    useTreasuryChartData(
      fromTimestampSeconds,
      activeChart === CHART_TYPE.apy && isUSDVault,
    );
  const { data: stakingData, isLoading: isStakingLoading } =
    useStakingChartData(
      fromTimestampSeconds,
      activeChart === CHART_TYPE.apy && isETHVault,
    );

  const vaultTvlDecimals = useMemo(() => {
    return data?.[0]?.tvl?.decimals ?? DEFAULT_DECIMALS;
  }, [data]);

  // Cutoff timestamp for 1M view: today's midnight minus 30 days.
  const oneMonthTimestampMs = useMemo(() => {
    const startOfTodayMs = new Date().setHours(0, 0, 0, 0);
    return startOfTodayMs - SECONDS_PER_DAY * 1000 * DAYS_BY_RANGE['1M'];
  }, []);

  const [tvlSeriesData, apySeriesData] = useMemo(() => {
    if (!data) return [[], []];
    const timestamps = data.map((item) =>
      unixTimestampToMs(Number(item.timestamp)),
    );
    return [
      data.map((item, i) => [timestamps[i], item.tvl.amount]),
      data.map((item, i) => [timestamps[i], Number(item.apy.value)]),
    ];
  }, [data]);

  // True when fetched data contains points older than 1M → 3M view is meaningful.
  const hasMoreThanOneMonthData = useMemo(() => {
    if (tvlSeriesData.length === 0) return false;
    const earliestTs = Math.min(...tvlSeriesData.map(([ts]) => ts as number));

    return earliestTs < oneMonthTimestampMs;
  }, [tvlSeriesData, oneMonthTimestampMs]);

  // For 1M view, filter the always-fetched 3M data to the last 30 days.
  // This avoids a refetch on range switch — just a client-side slice.
  const filteredTvlSeriesData = useMemo(
    () =>
      activeTimeRange === CHART_TIME_RANGE['1M']
        ? tvlSeriesData.filter(([ts]) => (ts as number) >= oneMonthTimestampMs)
        : tvlSeriesData,
    [tvlSeriesData, activeTimeRange, oneMonthTimestampMs],
  );
  const filteredApySeriesData = useMemo(
    () =>
      activeTimeRange === CHART_TIME_RANGE['1M']
        ? apySeriesData.filter(([ts]) => ts >= oneMonthTimestampMs)
        : apySeriesData,
    [apySeriesData, activeTimeRange, oneMonthTimestampMs],
  );

  const yAxisFormatter = useMemo(
    () =>
      activeChart === CHART_TYPE.tvl
        ? (value: string) => formatTvl(value, vaultTvlDecimals)
        : (value: string) => `${value}%`,
    [activeChart, vaultTvlDecimals],
  );

  const tooltipFormatter = useMemo(
    () => (params: TooltipComponentFormatterCallbackParams) =>
      formatTooltipContent(
        params,
        activeChart === CHART_TYPE.tvl,
        vaultTvlDecimals,
      ),
    [activeChart, vaultTvlDecimals],
  );

  // alignToVaultTimestamps uses filteredApySeriesData so treasury/staking series
  // are automatically trimmed to the same date range as the vault series.
  const treasurySeriesData = useMemo(
    (): [number, number][] =>
      treasuryData
        ? alignToVaultTimestamps(treasuryData, filteredApySeriesData)
        : [],
    [treasuryData, filteredApySeriesData],
  );
  const stakingSeriesData = useMemo(
    (): [number, number][] =>
      stakingData
        ? alignToVaultTimestamps(stakingData, filteredApySeriesData)
        : [],
    [stakingData, filteredApySeriesData],
  );
  const seriesData =
    activeChart === CHART_TYPE.tvl
      ? filteredTvlSeriesData
      : filteredApySeriesData;

  // Init chart once on mount. Chart div is always in the DOM (no early return), so ref is set.
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current, {}, { renderer: 'svg' });
    chartInstanceRef.current = chart;

    // ECharts fixes size at init; ResizeObserver triggers chart.resize() when the container size changes.
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  return {
    data,
    isTreasuryLoading,
    isStakingLoading,
    isVaultLoading,
    isLoadingError: isError,

    seriesData,
    treasurySeriesData,
    stakingSeriesData,
    yAxisFormatter,
    tooltipFormatter,
    hasMoreThanOneMonthData,

    chartRef,
    chartInstanceRef,
  };
};
