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

import { useTreasuryChartData } from './use-treasury-chart-data';
import { useStakingChartData } from './use-staking-chart-data';
import { useMetavaultChartData } from './use-vault-chart-data';

type UseChartDataProps = {
  fromTimestampSeconds: number;
  vaultAddress?: Address;
  isUSDVault: boolean;
  isETHVault: boolean;
  activeChart: 'tvl' | 'apy';
};

export const useChartData = (props: UseChartDataProps) => {
  const {
    fromTimestampSeconds,
    vaultAddress,
    isUSDVault,
    isETHVault,
    activeChart,
  } = props;

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  const { data, isLoading: isVaultLoading } = useMetavaultChartData(
    fromTimestampSeconds,
    vaultAddress,
  );
  const { data: treasuryData, isLoading: isTreasuryLoading } =
    useTreasuryChartData(
      fromTimestampSeconds,
      activeChart === 'apy' && isUSDVault,
    );
  const { data: stakingData, isLoading: isStakingLoading } =
    useStakingChartData(
      fromTimestampSeconds,
      activeChart === 'apy' && isETHVault,
    );

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

  const yAxisFormatter = useMemo(
    () =>
      activeChart === 'tvl'
        ? (value: string) => formatTvl(value)
        : (value: string) => `${value}%`,
    [activeChart],
  );

  const tooltipFormatter = useMemo(
    () => (params: TooltipComponentFormatterCallbackParams) =>
      formatTooltipContent(params, activeChart === 'tvl'),
    [activeChart],
  );

  const treasurySeriesData = useMemo(
    (): [number, number][] =>
      treasuryData ? alignToVaultTimestamps(treasuryData, apySeriesData) : [],
    [treasuryData, apySeriesData],
  );
  const stakingSeriesData = useMemo(
    (): [number, number][] =>
      stakingData ? alignToVaultTimestamps(stakingData, apySeriesData) : [],
    [stakingData, apySeriesData],
  );
  const seriesData = activeChart === 'tvl' ? tvlSeriesData : apySeriesData;

  // Init chart once on mount. Chart div is always in the DOM (no early return), so ref is set.
  useEffect(() => {
    if (!chartRef.current) return; // TODO: add invariant that chartRef is set by this point (check if it is safe)
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

    seriesData,
    treasurySeriesData,
    stakingSeriesData,
    yAxisFormatter,
    tooltipFormatter,

    chartRef,
    chartInstanceRef,
  };
};
