import { VaultAllocation } from 'features/earn/shared/vault-allocation/vault-allocation';

import { useGGVAllocation } from './hooks/useGGVAllocation';

export const Allocation = () => {
  const { data, isLoading, apy } = useGGVAllocation();

  return <VaultAllocation data={data} isLoading={isLoading} apy={apy} />;
};
