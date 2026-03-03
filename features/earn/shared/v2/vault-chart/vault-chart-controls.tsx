import { Switcher, SwitcherItem } from '@lidofinance/lido-ui';

import { SwitcherWrapper } from './styles';

export const CHART_TIME_RANGE = {
  '1M': '1M',
  '3M': '3M',
} as const;
export type ChartTimeRange = keyof typeof CHART_TIME_RANGE;

export const CHART_TYPE = {
  tvl: 'tvl',
  apy: 'apy',
} as const;
export type ChartType = keyof typeof CHART_TYPE;

type VaultChartControlsProps = {
  activeChart: ChartType;
  setActiveChart: (chart: ChartType) => void;
  activeTimeRange: ChartTimeRange;
  setActiveTimeRange: (timeRange: ChartTimeRange) => void;
  // False while data is loading or when vault history is shorter than 1 month.
  is3MAvailable: boolean;
  disableControls: boolean;
};

export const VaultChartControls = (props: VaultChartControlsProps) => {
  const {
    activeChart,
    setActiveChart,
    activeTimeRange,
    setActiveTimeRange,
    is3MAvailable,
    disableControls,
  } = props;

  const handleChartChange = (chart: ChartType) => {
    setActiveChart(chart);
  };

  const handleTimeRangeChange = (timeRange: ChartTimeRange) => {
    setActiveTimeRange(timeRange);
  };

  return (
    <SwitcherWrapper disabled={disableControls}>
      <Switcher>
        <SwitcherItem
          active={activeChart === CHART_TYPE.apy}
          onClick={() => handleChartChange(CHART_TYPE.apy)}
        >
          APY
        </SwitcherItem>
        <SwitcherItem
          active={activeChart === CHART_TYPE.tvl}
          onClick={() => handleChartChange(CHART_TYPE.tvl)}
        >
          TVL
        </SwitcherItem>
      </Switcher>
      {is3MAvailable && (
        <Switcher>
          <SwitcherItem
            active={activeTimeRange === CHART_TIME_RANGE['1M']}
            onClick={() => handleTimeRangeChange(CHART_TIME_RANGE['1M'])}
          >
            1M
          </SwitcherItem>
          <SwitcherItem
            active={activeTimeRange === CHART_TIME_RANGE['3M']}
            onClick={() => handleTimeRangeChange(CHART_TIME_RANGE['3M'])}
          >
            3M
          </SwitcherItem>
        </Switcher>
      )}
    </SwitcherWrapper>
  );
};
