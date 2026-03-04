import React, { useEffect, useMemo, useRef, useState } from 'react';

import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';

import { useThemeToggle } from '@lidofinance/lido-ui';

import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';
import { LOCALE } from 'config/groups/locale';

import {
  VaultChartControls,
  ChartTimeRange,
  CHART_TIME_RANGE,
  ChartType,
  CHART_TYPE,
} from './vault-chart-controls';
import { SECONDS_PER_DAY, DAYS_BY_RANGE } from './consts';
import { buildChartSeries } from './utils';
import { useChartData } from './hooks';
import { ChartInlineLoaderStyled, ErrorMessageStyled } from './styles';

// ECharts tree-shaking: register only the components we use. Must run before echarts.init().
echarts.use([SVGRenderer, LineChart, TooltipComponent, GridComponent]);

type VaultChartProps = {
  vaultName: 'ethVault' | 'usdVault';
};

export const VaultChart = (props: VaultChartProps) => {
  const { vaultName } = props;

  const { themeName } = useThemeToggle();
  const isDark = themeName === 'dark';

  const isETHVault = vaultName === 'ethVault';
  const isUSDVault = vaultName === 'usdVault';

  // const vaultAddress = getContractAddress(CHAINS.Mainnet, vaultName);
  // TODO: REPLACE BEFORE RELEASE
  const vaultAddress = getContractAddress(
    CHAINS.Mainnet,
    //@ts-expect-error currently using test contracts, prod contract addresses are using __ prefix now
    isETHVault ? 'stgVault' : '__usdVault',
  );

  const [activeChart, setActiveChart] = useState<ChartType>(CHART_TYPE.apy);
  const [activeTimeRange, setActiveTimeRange] = useState<ChartTimeRange>(
    CHART_TIME_RANGE['1M'],
  );

  // Always fetch 3M of data; 1M view is filtered client-side inside useChartData.
  // This means switching between 1M and 3M is instant with no extra network request.
  const fromTimestampSeconds = useMemo(() => {
    const startOfTodayMs = new Date().setHours(0, 0, 0, 0); // local midnight, returns ms
    return (
      Math.floor(startOfTodayMs / 1000) - SECONDS_PER_DAY * DAYS_BY_RANGE['3M']
    );
  }, []);

  const {
    data,
    isVaultLoading,
    isTreasuryLoading,
    isStakingLoading,
    isLoadingError,

    seriesData,
    treasurySeriesData,
    stakingSeriesData,
    yAxisFormatter,
    tooltipFormatter,
    hasMoreThanOneMonthData,
    chartRef,
    chartInstanceRef,
  } = useChartData({
    fromTimestampSeconds,
    vaultAddress,
    isUSDVault,
    isETHVault,
    activeChart,
    activeTimeRange,
  });

  // Distinguish first load (show skeleton for controls + chart) from later loads (controls stay, only chart area shows loading).
  const hasEverLoadedRef = useRef(false);
  if (data) hasEverLoadedRef.current = true;
  const isInitialLoading = isVaultLoading && !hasEverLoadedRef.current;

  // Apply options when data or chart type (TVL/APY) changes. notMerge: true fully replaces options so y-axis scale and formatter reset correctly.
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart || !data) return;
    chart.setOption(
      {
        animation: false,
        // grid: offsets from container; containLabel: false so labels sit outside the plot area.
        grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: false },
        tooltip: {
          trigger: 'axis',
          confine: true,
          formatter: tooltipFormatter,
          ...(isDark && {
            backgroundColor: '#131317',
            borderColor: '#131317',
          }),
        },
        xAxis: {
          type: 'time', // timestamps come from series.data[][0]; xAxis.data is ignored
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            hideOverlap: true, // hide labels that overlap when the chart is narrow
            formatter: (value: number) =>
              new Date(value).toLocaleDateString(LOCALE, {
                day: 'numeric',
                month: 'short',
              }),
          },
        },
        yAxis: {
          type: 'value',
          position: 'right',
          axisLabel: { formatter: yAxisFormatter },
          splitLine: {
            lineStyle: {
              ...(isDark && { color: '#DAE0E529' }),
            },
          },
        },
        series: buildChartSeries({
          activeChart,
          seriesData: seriesData as [number, string | number][],
          treasurySeriesData,
          stakingSeriesData,
          isUSDVault,
          isETHVault,
        }),
      },
      true,
    );
  }, [
    activeChart,
    data,
    isDark,
    seriesData,
    treasurySeriesData,
    stakingSeriesData,
    tooltipFormatter,
    yAxisFormatter,
    chartInstanceRef,
    isUSDVault,
    isETHVault,
  ]);

  // TODO: break this up into variables for more clear logic
  const isChartLoading =
    activeChart === CHART_TYPE.apy
      ? isVaultLoading ||
        (isUSDVault && isTreasuryLoading) ||
        (isETHVault && isStakingLoading)
      : isVaultLoading;

  return (
    <VaultChartControls
      isInitialLoading={isInitialLoading}
      activeChart={activeChart}
      setActiveChart={setActiveChart}
      activeTimeRange={activeTimeRange}
      setActiveTimeRange={setActiveTimeRange}
      is3MAvailable={hasMoreThanOneMonthData}
      disableControls={isLoadingError}
    >
      {/* Wrapper has fixed height; chart div is absolute so ECharts’ fixed-size SVG doesn’t block flex shrink. Chart stays mounted so init runs once. */}
      <div style={{ position: 'relative', width: '100%', height: '305px' }}>
        {isChartLoading && <ChartInlineLoaderStyled />}
        {isLoadingError && (
          <ErrorMessageStyled>No data available</ErrorMessageStyled>
        )}
        <div
          ref={chartRef}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isChartLoading ? 0 : 1,
          }}
        />
      </div>
    </VaultChartControls>
  );
};
