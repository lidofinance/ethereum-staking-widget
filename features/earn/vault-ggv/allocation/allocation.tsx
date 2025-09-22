import {
  Block,
  ChartLine,
  ChartLineBorderType,
  ChartLineThresholdType,
} from '@lidofinance/lido-ui';

import { Section } from 'shared/components';

import { useGGVAllocation } from './hooks/useGGVAllocation';
import { AllocationTable } from './allocation-table/allocation-Table';
import { AllocationLegend } from './allocation-legend';
import { AllocationSummary } from './allocation-summary';

export const Allocation = () => {
  const { data, isLoading, apy } = useGGVAllocation();

  if (!data || isLoading) return null;

  return (
    <Section title="Allocation">
      <Block>
        <ChartLine
          border={ChartLineBorderType.rounded}
          thresholdType={ChartLineThresholdType.dash}
          data={data.chartData}
          height={12}
          data-testid="allocation-chart"
        />
        <AllocationLegend data={data.chartData} />
        <AllocationTable allocation={data.allocations} />
        <AllocationSummary
          apy={apy}
          totalTvlUSD={data.totalTvlUSD}
          totalTvlETH={data.totalTvlETH}
        />
      </Block>
    </Section>
  );
};
