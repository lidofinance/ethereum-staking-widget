import { Skeleton } from '@lidofinance/lido-app-ui';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import {
  CHART_TIME_RANGE,
  CHART_TYPE,
  type ChartTimeRange,
  type ChartType,
} from './consts';
import { ControlsRow, GhostSegmentedControl } from './styles';

export type VaultPerformanceMatomo = {
  clickChartsTvlTab?: MATOMO_EVENT_TYPE;
  clickChartsTvl1m?: MATOMO_EVENT_TYPE;
  clickChartsTvl3m?: MATOMO_EVENT_TYPE;
  clickChartsApyTab?: MATOMO_EVENT_TYPE;
  clickChartsApy1m?: MATOMO_EVENT_TYPE;
  clickChartsApy3m?: MATOMO_EVENT_TYPE;
};

type PerformanceControlsProps = {
  activeChart: ChartType;
  onChartChange: (chart: ChartType) => void;
  activeTimeRange: ChartTimeRange;
  onTimeRangeChange: (timeRange: ChartTimeRange) => void;
  isInitialLoading: boolean;
  is3MAvailable: boolean;
  isAllAvailable: boolean;
  disabled: boolean;
  matomo?: VaultPerformanceMatomo;
};

const getTimeRangeEvent = (
  chart: ChartType,
  timeRange: ChartTimeRange,
  matomo: VaultPerformanceMatomo,
): MATOMO_EVENT_TYPE | undefined => {
  const isApy = chart === CHART_TYPE.apy;
  if (timeRange === CHART_TIME_RANGE['1M']) {
    return isApy ? matomo.clickChartsApy1m : matomo.clickChartsTvl1m;
  }
  if (timeRange === CHART_TIME_RANGE['3M']) {
    return isApy ? matomo.clickChartsApy3m : matomo.clickChartsTvl3m;
  }
  return undefined;
};

export const PerformanceControls = ({
  activeChart,
  onChartChange,
  activeTimeRange,
  onTimeRangeChange,
  isInitialLoading,
  is3MAvailable,
  isAllAvailable,
  disabled,
  matomo = {},
}: PerformanceControlsProps) => {
  const timeRangeItems = [
    { value: CHART_TIME_RANGE['1M'], label: '1M', testId: '1m-option' },
    ...(is3MAvailable
      ? [{ value: CHART_TIME_RANGE['3M'], label: '3M', testId: '3m-option' }]
      : []),
    ...(isAllAvailable
      ? [{ value: CHART_TIME_RANGE.All, label: 'All', testId: 'all-option' }]
      : []),
  ].map(({ value, label, testId }) => ({
    value,
    label,
    disabled,
    dataTestId: { root: testId },
  }));

  const chartItems = [
    { value: CHART_TYPE.apy, label: 'APY', testId: 'apy-option' },
    { value: CHART_TYPE.tvl, label: 'TVL', testId: 'tvl-option' },
  ].map(({ value, label, testId }) => ({
    value,
    label,
    disabled,
    dataTestId: { root: testId },
  }));

  const handleTimeRangeChange = (value: string) => {
    const timeRange = value as ChartTimeRange;
    onTimeRangeChange(timeRange);
    const event = getTimeRangeEvent(activeChart, timeRange, matomo);
    if (event) trackMatomoEvent(event);
  };

  const handleChartChange = (value: string) => {
    const chart = value as ChartType;
    onChartChange(chart);
    const event =
      chart === CHART_TYPE.apy
        ? matomo.clickChartsApyTab
        : matomo.clickChartsTvlTab;
    if (event) trackMatomoEvent(event);
  };

  const renderTimeRange = () => {
    if (isInitialLoading) return <Skeleton width={136} height={28} />;
    // One option only gives nothing to choose
    if (timeRangeItems.length < 2) return null;

    return (
      <GhostSegmentedControl
        aria-label="Time range"
        items={timeRangeItems}
        value={activeTimeRange}
        onChange={handleTimeRangeChange}
        dataTestId={{ root: 'time-switcher' }}
      />
    );
  };

  return (
    <ControlsRow>
      {renderTimeRange()}
      <GhostSegmentedControl
        aria-label="Metric"
        items={chartItems}
        value={activeChart}
        onChange={handleChartChange}
        dataTestId={{ root: 'data-switcher' }}
      />
    </ControlsRow>
  );
};
