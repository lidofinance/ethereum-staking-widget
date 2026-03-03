import React, { useEffect, useMemo, useRef, useState } from 'react';

import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';

import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';
import { LOCALE } from 'config/groups/locale';

import { VaultChartControls } from './vault-chart-controls';
import { SECONDS_PER_DAY, DAYS_BY_RANGE } from './consts';
import { buildChartSeries } from './utils';
import { useChartData } from './hooks';
import { ChartInlineLoaderStyled, SwitchersInlineLoaderStyled } from './styles';

// ECharts tree-shaking: register only the components we use. Must run before echarts.init().
echarts.use([SVGRenderer, LineChart, TooltipComponent, GridComponent]);

type VaultChartProps = {
  vaultName: 'ethVault' | 'usdVault';
};

export const VaultChart = (props: VaultChartProps) => {
  const { vaultName } = props;

  const isETHVault = vaultName === 'ethVault';
  const isUSDVault = vaultName === 'usdVault';

  // const vaultAddress = getContractAddress(CHAINS.Mainnet, vaultName);
  // TODO: REPLACE BEFORE RELEASE
  const vaultAddress = getContractAddress(
    CHAINS.Mainnet,
    //@ts-expect-error currently using test contracts, prod contract addresses are using __ prefix now
    isETHVault ? 'stgVault' : '__usdVault',
  );

  const [activeChart, setActiveChart] = useState<'tvl' | 'apy'>('tvl');
  const [activeTimeRange, setActiveTimeRange] = useState<'1M' | '3M'>('1M');

  const fromTimestampSeconds = useMemo(() => {
    const days = DAYS_BY_RANGE[activeTimeRange];
    if (!days) return 0;
    const startOfTodayMs = new Date().setHours(0, 0, 0, 0); // local midnight, returns ms

    return Math.floor(startOfTodayMs / 1000) - SECONDS_PER_DAY * days;
  }, [activeTimeRange]);

  const {
    data,
    isVaultLoading,
    isTreasuryLoading,
    isStakingLoading,

    seriesData,
    treasurySeriesData,
    stakingSeriesData,
    yAxisFormatter,
    tooltipFormatter,
    chartRef,
    chartInstanceRef,
  } = useChartData({
    fromTimestampSeconds,
    vaultAddress,
    isUSDVault,
    isETHVault,
    activeChart,
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
          position: (pt: number[]) => [pt[0], '10%'], // keep tooltip inside chart when hovering near the left edge
          formatter: tooltipFormatter,
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
    activeChart === 'apy'
      ? isVaultLoading ||
        (isUSDVault && isTreasuryLoading) ||
        (isETHVault && isStakingLoading)
      : isVaultLoading;

  return (
    <>
      {isInitialLoading ? (
        <SwitchersInlineLoaderStyled />
      ) : (
        <VaultChartControls
          activeChart={activeChart}
          setActiveChart={setActiveChart}
          activeTimeRange={activeTimeRange}
          setActiveTimeRange={setActiveTimeRange}
        />
      )}
      {/* Wrapper has fixed height; chart div is absolute so ECharts’ fixed-size SVG doesn’t block flex shrink. Chart stays mounted so init runs once. */}
      <div style={{ position: 'relative', width: '100%', height: '305px' }}>
        {isChartLoading && <ChartInlineLoaderStyled />}
        <div
          ref={chartRef}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isChartLoading ? 0 : 1,
          }}
        />
      </div>
    </>
  );
};
