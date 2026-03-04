import { PropsWithChildren } from 'react';

import {
  SwitcherWrapper,
  SwitcherItemStyled,
  SwitchersInlineLoaderStyled,
  SwitcherStyled,
} from './styles';

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
  isInitialLoading: boolean;
  activeChart: ChartType;
  setActiveChart: (chart: ChartType) => void;
  activeTimeRange: ChartTimeRange;
  setActiveTimeRange: (timeRange: ChartTimeRange) => void;
  // False while data is loading or when vault history is shorter than 1 month.
  is3MAvailable: boolean;
  disableControls: boolean;
};

export const VaultChartControls = (
  props: PropsWithChildren<VaultChartControlsProps>,
) => {
  const {
    isInitialLoading,
    activeChart,
    setActiveChart,
    activeTimeRange,
    setActiveTimeRange,
    is3MAvailable,
    disableControls,
    children,
  } = props;

  const handleChartChange = (chart: ChartType) => {
    setActiveChart(chart);
  };

  const handleTimeRangeChange = (timeRange: ChartTimeRange) => {
    setActiveTimeRange(timeRange);
  };

  return (
    <SwitcherWrapper $isLoading={isInitialLoading}>
      {isInitialLoading ? (
        <SwitchersInlineLoaderStyled />
      ) : (
        <SwitcherStyled $disabled={disableControls}>
          <SwitcherItemStyled
            active={activeChart === CHART_TYPE.apy}
            onClick={() => handleChartChange(CHART_TYPE.apy)}
          >
            APY
          </SwitcherItemStyled>
          <SwitcherItemStyled
            active={activeChart === CHART_TYPE.tvl}
            onClick={() => handleChartChange(CHART_TYPE.tvl)}
          >
            TVL
          </SwitcherItemStyled>
        </SwitcherStyled>
      )}
      {children}
      {!isInitialLoading && is3MAvailable && (
        <SwitcherStyled $disabled={disableControls}>
          <SwitcherItemStyled
            active={activeTimeRange === CHART_TIME_RANGE['1M']}
            onClick={() => handleTimeRangeChange(CHART_TIME_RANGE['1M'])}
          >
            1M
          </SwitcherItemStyled>
          <SwitcherItemStyled
            active={activeTimeRange === CHART_TIME_RANGE['3M']}
            onClick={() => handleTimeRangeChange(CHART_TIME_RANGE['3M'])}
          >
            3M
          </SwitcherItemStyled>
        </SwitcherStyled>
      )}
    </SwitcherWrapper>
  );
};
