import { useEffect, useMemo, useState } from 'react';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { Skeleton, Typography } from '@lidofinance/lido-app-ui';
import { useThemeToggle } from '@lidofinance/lido-ui';

import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';

import { EarnCard, EarnCardTitle } from '../earn-card';

import {
  CHART_TIME_RANGE,
  CHART_TYPE,
  VAULT_LABEL,
  type ChartTimeRange,
  type ChartType,
  type VaultName,
} from './consts';
import { readChartColors } from './chart-colors';
import { buildChartOption } from './chart-options';
import { buildChartSeries, getLegendItems } from './utils';
import { useChartData, useEChartsInstance } from './hooks';
import {
  PerformanceControls,
  type VaultPerformanceMatomo,
} from './performance-controls';
import { PerformanceLegend } from './performance-legend';
import { ChartNode, EmptyPlot, PlotOverlay, PlotWrapper } from './styles';

// ECharts tree-shaking: register only what the chart uses, before echarts.init()
echarts.use([SVGRenderer, LineChart, TooltipComponent, GridComponent]);

type VaultPerformanceProps = {
  vaultName: VaultName;
  // DOM id for in-page anchors
  id?: string;
  matomo?: VaultPerformanceMatomo;
};

export const VaultPerformance = ({
  vaultName,
  id,
  matomo,
}: VaultPerformanceProps) => {
  // ECharts needs real colour values; read them again when the theme changes
  const { themeName } = useThemeToggle();
  const isETHVault = vaultName === 'ethVault';
  const isUSDVault = vaultName === 'usdVault';
  const vaultLabel = VAULT_LABEL[vaultName];
  const vaultAddress = getContractAddress(CHAINS.Mainnet, vaultName);

  const [activeChart, setActiveChart] = useState<ChartType>(CHART_TYPE.apy);
  const [activeTimeRange, setActiveTimeRange] = useState<ChartTimeRange>(
    CHART_TIME_RANGE['1M'],
  );

  const { chartRef, chartInstanceRef } = useEChartsInstance();
  const {
    data,
    isVaultLoading,
    isChartLoading,
    isLoadingError,
    seriesData,
    treasurySeriesData,
    stakingSeriesData,
    latest,
    is3MAvailable,
    isAllAvailable,
  } = useChartData({
    vaultAddress,
    isUSDVault,
    isETHVault,
    activeChart,
    activeTimeRange,
  });

  // The first load shows skeletons for the controls too. Later loads keep the controls.
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (data) setHasLoaded(true);
  }, [data]);
  const isInitialLoading = isVaultLoading && !hasLoaded;

  const isNoDataAvailable = isLoadingError || (!!data && data.length === 0);

  // A young vault has no 3M or All option; do not keep a hidden selection
  useEffect(() => {
    const isHidden =
      (activeTimeRange === CHART_TIME_RANGE['3M'] && !is3MAvailable) ||
      (activeTimeRange === CHART_TIME_RANGE.All && !isAllAvailable);
    if (data && isHidden) setActiveTimeRange(CHART_TIME_RANGE['1M']);
  }, [activeTimeRange, data, is3MAvailable, isAllAvailable]);

  // notMerge replaces the options fully, so the y axis scale and format reset
  useEffect(() => {
    const chart = chartInstanceRef.current;
    const node = chartRef.current;
    if (!chart || !node || !data) return;

    const colors = readChartColors(node);
    const series = buildChartSeries({
      activeChart,
      vaultLabel,
      seriesData,
      treasurySeriesData,
      stakingSeriesData,
      isUSDVault,
      isETHVault,
      colors,
    });
    chart.setOption(
      buildChartOption({ activeChart, isETHVault, colors, series }),
      true,
    );
  }, [
    activeChart,
    data,
    seriesData,
    treasurySeriesData,
    stakingSeriesData,
    vaultLabel,
    isUSDVault,
    isETHVault,
    themeName,
    chartRef,
    chartInstanceRef,
  ]);

  const legendItems = useMemo(
    () => getLegendItems({ activeChart, vaultLabel, isETHVault, latest }),
    [activeChart, vaultLabel, isETHVault, latest],
  );

  return (
    <EarnCard id={id} align="stretch" gap={12} data-testid="performance">
      <EarnCardTitle>Performance</EarnCardTitle>
      <PerformanceLegend
        items={legendItems}
        isLoading={isChartLoading && !isNoDataAvailable}
      />
      <PlotWrapper>
        {!isNoDataAvailable && isChartLoading && (
          <PlotOverlay>
            <Skeleton width="100%" height="100%" />
          </PlotOverlay>
        )}
        {isNoDataAvailable && (
          <EmptyPlot>
            <Typography
              variant="body"
              color="secondary"
              data-testid="no-metric-data"
            >
              No data available
            </Typography>
          </EmptyPlot>
        )}
        <ChartNode
          ref={chartRef}
          $hidden={isChartLoading || isNoDataAvailable}
          data-testid="metrics"
        />
      </PlotWrapper>
      <PerformanceControls
        activeChart={activeChart}
        onChartChange={setActiveChart}
        activeTimeRange={activeTimeRange}
        onTimeRangeChange={setActiveTimeRange}
        isInitialLoading={isInitialLoading}
        is3MAvailable={is3MAvailable}
        isAllAvailable={isAllAvailable}
        disabled={isNoDataAvailable}
        matomo={matomo}
      />
    </EarnCard>
  );
};
