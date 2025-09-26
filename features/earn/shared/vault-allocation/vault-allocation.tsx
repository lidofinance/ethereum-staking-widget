import { FC } from 'react';
import {
  Block,
  ChartLine,
  ChartLineBorderType,
  ChartLineThresholdType,
  Loader,
} from '@lidofinance/lido-ui';

import { Section } from 'shared/components';

import { AllocationTable } from './allocation-table/allocation-Table';
import { AllocationLegend } from './allocation-legend';
import { AllocationSummary } from './allocation-summary';

import { LastUpdatedStyled, LoaderWrapperStyled } from './styles';
import { VaultAllocationProps } from './types';

export const VaultAllocation: FC<VaultAllocationProps> = (props) => {
  const { data, isLoading, apy } = props;

  if (!data || isLoading)
    return (
      <Section title="Allocation">
        <Block>
          <LoaderWrapperStyled>
            <Loader />
          </LoaderWrapperStyled>
        </Block>
      </Section>
    );

  if (!data && !isLoading)
    return (
      <Section title="Allocation">
        <Block>No data available</Block>
      </Section>
    );
  return (
    <Section
      title="Allocation"
      headerDecorator={
        <LastUpdatedStyled>
          Last updated:{' '}
          {new Date(Number(data.lastUpdated) * 1000).toLocaleDateString(
            'en-US',
            {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZoneName: 'short',
            },
          )}
        </LastUpdatedStyled>
      }
    >
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
