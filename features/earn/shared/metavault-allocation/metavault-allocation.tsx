import { useMemo } from 'react';

import { getContractAddress } from 'config/networks/contract-address';
import { useConfig } from 'config/use-config';
import { CHAINS } from 'consts/chains';

import { AllocationCard } from './allocation-card';
import { getAllocationLabelAllowlist } from './consts';
import { useAllocationData } from './hooks/use-allocation-data';
import { useMetavaultAllocation } from './hooks/use-metavault-allocation';
import type { MetavaultAllocationProps } from './types';

export const MetavaultAllocation = ({
  vaultName,
  id,
  updatedTooltip,
}: MetavaultAllocationProps) => {
  const vaultAddress = getContractAddress(CHAINS.Mainnet, vaultName);
  const {
    earnAllocation: { labelAllowList: configuredLabelAllowlist, hiddenIds },
  } = useConfig().externalConfig;
  const allocationLabelAllowlist = useMemo(
    () => getAllocationLabelAllowlist(configuredLabelAllowlist),
    [configuredLabelAllowlist],
  );

  const { data, isLoading, isError } = useMetavaultAllocation(vaultAddress);
  const allocationData = useAllocationData(
    data,
    allocationLabelAllowlist,
    hiddenIds,
  );

  return (
    <AllocationCard
      id={id}
      updatedTooltip={updatedTooltip}
      data={allocationData}
      isLoading={isLoading}
      isError={isError}
    />
  );
};
