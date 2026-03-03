import { Switcher, SwitcherItem } from '@lidofinance/lido-ui';

import { SwitcherWrapper } from './styles';

type VaultChartControlsProps = {
  activeChart: 'tvl' | 'apy';
  setActiveChart: (chart: 'tvl' | 'apy') => void;
  activeTimeRange: '1M' | '3M';
  setActiveTimeRange: (timeRange: '1M' | '3M') => void;
};

export const VaultChartControls = (props: VaultChartControlsProps) => {
  const { activeChart, setActiveChart, activeTimeRange, setActiveTimeRange } =
    props;

  const handleChartChange = (chart: 'tvl' | 'apy') => {
    setActiveChart(chart);
  };

  const handleTimeRangeChange = (timeRange: '1M' | '3M') => {
    setActiveTimeRange(timeRange);
  };

  return (
    <SwitcherWrapper>
      <Switcher>
        <SwitcherItem
          active={activeChart === 'tvl'}
          onClick={() => handleChartChange('tvl')}
        >
          TVL
        </SwitcherItem>
        <SwitcherItem
          active={activeChart === 'apy'}
          onClick={() => handleChartChange('apy')}
        >
          APY
        </SwitcherItem>
      </Switcher>
      <Switcher>
        <SwitcherItem
          active={activeTimeRange === '1M'}
          onClick={() => handleTimeRangeChange('1M')}
        >
          1M
        </SwitcherItem>
        <SwitcherItem
          active={activeTimeRange === '3M'}
          onClick={() => handleTimeRangeChange('3M')}
        >
          3M
        </SwitcherItem>
      </Switcher>
    </SwitcherWrapper>
  );
};
