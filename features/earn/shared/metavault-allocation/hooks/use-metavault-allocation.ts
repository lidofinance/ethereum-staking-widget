import { Address } from 'viem';
import { useQuery } from '@tanstack/react-query';

import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';

import { fetchMetavaultsAllocationData } from '../apy-data/metavaults-allocation';

export const useMetavaultAllocation = (vaultAddress?: Address) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['metavault-allocation', vaultAddress],
    queryFn: () => fetchMetavaultsAllocationData(vaultAddress),
    enabled: !!vaultAddress,
    ...STRATEGY_CONSTANT,
  });

  return { data, isLoading, isError };
};
