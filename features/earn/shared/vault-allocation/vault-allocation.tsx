import { FC } from 'react';
import {
  Block,
  ChartLine,
  ChartLineBorderType,
  ChartLineThresholdType,
  Loader,
} from '@lidofinance/lido-ui';

import { Section } from 'shared/components';
import { LOCALE } from 'config/groups/locale';

import { AllocationTable } from './allocation-table/allocation-Table';
import { AllocationLegend } from './allocation-legend';
import { AllocationSummary } from './allocation-summary';

import {
  LastUpdatedStyled,
  LoaderWrapperStyled,
  EmptyBlockStyled,
  Footer,
} from './styles';
import { VaultAllocationProps } from './types';

export const VaultAllocation: FC<VaultAllocationProps> = (props) => {
  const { data, isLoading, apy, footer } = props;

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
        <EmptyBlockStyled>No data available for now</EmptyBlockStyled>
      </Section>
    );

  return (
    <Section
      title="Allocation"
      headerDecorator={
        <LastUpdatedStyled>
          Last updated:{' '}
          {new Date(Number(data.lastUpdated) * 1000).toLocaleString(LOCALE, {
            dateStyle: 'medium',
            timeStyle: 'short',
            hour12: false,
          })}
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
        {footer && <Footer>{footer}</Footer>}
      </Block>
    </Section>
  );
};
