import { FC } from 'react';
import {
  ChartLine,
  ChartLineBorderType,
  ChartLineThresholdType,
  Loader,
} from '@lidofinance/lido-ui';

import { getContractAddress } from 'config/networks/contract-address';
import { CHAINS } from 'consts/chains';
import { Section } from 'shared/components';
import { AllocationLegend } from 'features/earn/shared/vault-allocation/allocation-legend';
import { AllocationSummary } from 'features/earn/shared/vault-allocation/allocation-summary';
import {
  LastUpdatedStyled,
  LoaderWrapperStyled,
  EmptyBlockStyled,
  Footer,
} from './styles';
import { formatLastUpdatedDate } from 'features/earn/shared/vault-allocation/utils';

import { AllocationTable } from './allocation-table/allocation-table';
import { useAllocationData } from './hooks/use-allocation-data';
import { VaultAllocationProps } from './types';
import { useMetavaultAllocation } from './hooks/use-metavault-allocation';

export const VaultAllocation: FC<VaultAllocationProps> = (props) => {
  const { vaultName, footer } = props;

  const vaultAddress = getContractAddress(CHAINS.Mainnet, vaultName);

  const { data, isLoading } = useMetavaultAllocation(vaultAddress);
  const allocationData = useAllocationData(data);

  if (isLoading) {
    return (
      <Section title="Allocation">
        <LoaderWrapperStyled>
          <Loader />
        </LoaderWrapperStyled>
      </Section>
    );
  }

  if (!allocationData.groups?.length && !allocationData.flatItems?.length) {
    return (
      <Section title="Allocation">
        <EmptyBlockStyled>No data available for now</EmptyBlockStyled>
      </Section>
    );
  }

  return (
    <Section
      title=" "
      headerDecorator={
        <LastUpdatedStyled>
          Last updated: {formatLastUpdatedDate(allocationData.lastUpdated)}
        </LastUpdatedStyled>
      }
      $noMargin
    >
      <ChartLine
        border={ChartLineBorderType.rounded}
        thresholdType={ChartLineThresholdType.dash}
        data={allocationData.chartData}
        height={12}
        data-testid="allocation-chart"
      />
      <AllocationLegend data={allocationData.chartData} />
      <AllocationTable
        groups={allocationData.groups}
        flatItems={allocationData.flatItems}
      />
      <AllocationSummary totalTvlUsd={allocationData.totalTvlUsd} />
      {footer && <Footer>{footer}</Footer>}
    </Section>
  );
};
