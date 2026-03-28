import React, { useEffect, useMemo, useRef, useState } from 'react';

import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';

import { useThemeToggle } from '@lidofinance/lido-ui';

import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';
import { LOCALE } from 'config/groups/locale';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';

import {
  VaultChartControls,
  ChartTimeRange,
  CHART_TIME_RANGE,
  ChartType,
  CHART_TYPE,
} from './vault-chart-controls';
import { SECONDS_PER_DAY, DAYS_BY_RANGE } from './consts';
import { buildChartSeries, formatDate } from './utils';
import { useChartData } from './hooks';
import {
  ChartInlineLoaderStyled,
  ErrorMessageStyled,
  LastTimestampStyled,
} from './styles';

// ECharts tree-shaking: register only the components we use. Must run before echarts.init().
echarts.use([SVGRenderer, LineChart, TooltipComponent, GridComponent]);

type VaultChartProps = {
  vaultName: 'ethVault' | 'usdVault';
  tvlUsd: number | null | undefined;
  tvlBaseAsset: bigint | undefined;
  tvlUpdateTimestampMs: number | undefined;
  matomo?: {
    clickChartsTvlTab?: MATOMO_EVENT_TYPE;
    clickChartsTvl1m?: MATOMO_EVENT_TYPE;
    clickChartsTvl3m?: MATOMO_EVENT_TYPE;
    clickChartsApyTab?: MATOMO_EVENT_TYPE;
    clickChartsApy1m?: MATOMO_EVENT_TYPE;
    clickChartsApy3m?: MATOMO_EVENT_TYPE;
  };
};

export const VaultChart = (props: VaultChartProps) => {
  const { vaultName, matomo, tvlUsd, tvlBaseAsset, tvlUpdateTimestampMs } =
    props;

  const { themeName } = useThemeToggle();
  const isDark = themeName === 'dark';

  const isETHVault = vaultName === 'ethVault';
  const isUSDVault = vaultName === 'usdVault';

  const vaultAddress = getContractAddress(CHAINS.Mainnet, vaultName);

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
    tvlUsd,
    tvlBaseAsset,
    tvlUpdateTimestampMs,
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
        grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: false },
        tooltip: {
          trigger: 'axis',
          confine: true,
          formatter: tooltipFormatter,
          extraCssText:
            'min-width:170px;border-radius:10px;padding:12px;gap: 8px;box-shadow: 0 4px 16px 0 rgba(0, 10, 61, 0.16);',
          textStyle: {
            fontFamily: 'Manrope, sans-serif',
            color: isDark ? '#fff' : '#273852',
          },
          ...(isDark && {
            backgroundColor: '#131317',
            borderColor: '#131317',
          }),
        },
        xAxis: {
          type: 'time', // timestamps come from series.data[][0]; xAxis.data is ignored
          // Without minInterval, users with a large UTC offset can get two ticks
          // per calendar day (local midnight + UTC midnight) formatted as the same date.
          minInterval: 24 * 3600 * 1000,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            hideOverlap: true, // hide labels that overlap when the chart is narrow

            color: isDark ? 'rgba(255,255,255,0.8)' : '#7A8AA0',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 400,
            // Local timezone matches tick positions (local midnight boundaries).
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
          axisLabel: {
            formatter: yAxisFormatter,
            color: isDark ? 'rgba(255,255,255,0.8)' : '#7A8AA0',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 400,
          },
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

  const lastTimeStamp = seriesData?.[seriesData.length - 1]?.[0];

  const isApyChart = activeChart === CHART_TYPE.apy;

  // TODO: break this up into variables for more clear logic
  const isChartLoading = isApyChart
    ? isVaultLoading ||
      (isUSDVault && isTreasuryLoading) ||
      (isETHVault && isStakingLoading)
    : isVaultLoading;

  const isNoDataAvailable = isLoadingError || (!!data && data.length === 0);

  return (
    <div>
      <VaultChartControls
        isInitialLoading={isInitialLoading}
        activeChart={activeChart}
        setActiveChart={setActiveChart}
        activeTimeRange={activeTimeRange}
        setActiveTimeRange={setActiveTimeRange}
        is3MAvailable={hasMoreThanOneMonthData}
        disableControls={isNoDataAvailable}
        matomo={matomo}
      >
        {/* Wrapper has fixed height; chart div is absolute so ECharts’ fixed-size SVG doesn’t block flex shrink. Chart stays mounted so init runs once. */}
        <div style={{ position: 'relative', width: '100%', height: '305px' }}>
          {!isNoDataAvailable && isChartLoading && <ChartInlineLoaderStyled />}
          {isNoDataAvailable && (
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
      {!isNoDataAvailable && lastTimeStamp && (
        <LastTimestampStyled>
          Last updated: {formatDate(lastTimeStamp)}
        </LastTimestampStyled>
      )}
    </div>
  );
};
