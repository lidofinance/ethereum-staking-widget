import { FC } from 'react';
import {
  Block,
  ChartLine,
  ChartLineBorderType,
  ChartLineThresholdType,
  Loader,
} from '@lidofinance/lido-ui';

import { Section } from 'shared/components';

import { AllocationTable } from './allocation-table/allocation-table';
import { AllocationLegend } from './allocation-legend';
import { AllocationSummary } from './allocation-summary';

import {
  LastUpdatedStyled,
  LoaderWrapperStyled,
  EmptyBlockStyled,
  Footer,
} from './styles';
import { VaultAllocationProps } from './types';
import { formatLastUpdatedDate } from './utils';

export const VaultAllocation: FC<VaultAllocationProps> = (props) => {
  const { data, isLoading, apy, footer } = props;

  if (isLoading)
    return (
      <Section title="Allocation">
        <Block>
          <LoaderWrapperStyled>
            <Loader />
          </LoaderWrapperStyled>
        </Block>
      </Section>
    );

  if (!data || !data.positions?.length)
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
          Last updated: {formatLastUpdatedDate(data.lastUpdated)}
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
        <AllocationTable allocation={data.positions} />
        <AllocationSummary
          apy={apy}
          totalTvlUsd={data.totalTvlUsd}
          totalTvlWei={data.totalTvlWei}
        />
        {footer && <Footer>{footer}</Footer>}
      </Block>
    </Section>
  );
};
