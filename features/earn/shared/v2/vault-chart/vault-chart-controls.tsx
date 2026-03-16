import { PropsWithChildren } from 'react';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';

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
  matomo?: {
    clickChartsTvlTab?: MATOMO_EVENT_TYPE;
    clickChartsTvl1m?: MATOMO_EVENT_TYPE;
    clickChartsTvl3m?: MATOMO_EVENT_TYPE;
    clickChartsApyTab?: MATOMO_EVENT_TYPE;
    clickChartsApy1m?: MATOMO_EVENT_TYPE;
    clickChartsApy3m?: MATOMO_EVENT_TYPE;
  };
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
  const { matomo: matomoEvents = {} } = props;
  const {
    clickChartsApy1m,
    clickChartsApy3m,
    clickChartsTvl1m,
    clickChartsTvl3m,
    clickChartsApyTab,
    clickChartsTvlTab,
  } = matomoEvents;

  const handleChartChange = (chart: ChartType) => {
    setActiveChart(chart);
  };

  const handleTimeRangeChange = (timeRange: ChartTimeRange) => {
    setActiveTimeRange(timeRange);
  };

  const emitMatomoEventForTimeRange = (timeRange: ChartTimeRange) => {
    if (activeChart === CHART_TYPE.apy) {
      if (timeRange === CHART_TIME_RANGE['1M'] && clickChartsApy1m) {
        trackMatomoEvent(clickChartsApy1m);
      } else if (timeRange === CHART_TIME_RANGE['3M'] && clickChartsApy3m) {
        trackMatomoEvent(clickChartsApy3m);
      }
    } else if (activeChart === CHART_TYPE.tvl) {
      if (timeRange === CHART_TIME_RANGE['1M'] && clickChartsTvl1m) {
        trackMatomoEvent(clickChartsTvl1m);
      } else if (timeRange === CHART_TIME_RANGE['3M'] && clickChartsTvl3m) {
        trackMatomoEvent(clickChartsTvl3m);
      }
    }
  };

  return (
    <SwitcherWrapper $isLoading={isInitialLoading}>
      {isInitialLoading ? (
        <SwitchersInlineLoaderStyled />
      ) : (
        <SwitcherStyled $disabled={disableControls}>
          <SwitcherItemStyled
            active={activeChart === CHART_TYPE.apy}
            onClick={() => {
              handleChartChange(CHART_TYPE.apy);
              clickChartsApyTab && trackMatomoEvent(clickChartsApyTab);
            }}
          >
            APY
          </SwitcherItemStyled>
          <SwitcherItemStyled
            active={activeChart === CHART_TYPE.tvl}
            onClick={() => {
              handleChartChange(CHART_TYPE.tvl);
              clickChartsTvlTab && trackMatomoEvent(clickChartsTvlTab);
            }}
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
            onClick={() => {
              handleTimeRangeChange(CHART_TIME_RANGE['1M']);
              emitMatomoEventForTimeRange(CHART_TIME_RANGE['1M']);
            }}
          >
            1M
          </SwitcherItemStyled>
          <SwitcherItemStyled
            active={activeTimeRange === CHART_TIME_RANGE['3M']}
            onClick={() => {
              handleTimeRangeChange(CHART_TIME_RANGE['3M']);
              emitMatomoEventForTimeRange(CHART_TIME_RANGE['3M']);
            }}
          >
            3M
          </SwitcherItemStyled>
        </SwitcherStyled>
      )}
    </SwitcherWrapper>
  );
};
