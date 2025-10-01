import { VaultAllocation } from 'features/earn/shared/vault-allocation/vault-allocation';

import { useGGVAllocation } from './hooks/useGGVAllocation';

const FOOTER_TEXT =
  'Data is provided by Veda’s API and reflects the most recent snapshot at the time of update. As a result, the Total TVL shown here may differ from the vault’s TVL due to the data timestamp';

export const Allocation = () => {
  const { data, isLoading, apy } = useGGVAllocation();

  return (
    <VaultAllocation
      data={data}
      isLoading={isLoading}
      apy={apy}
      footer={FOOTER_TEXT}
    />
  );
};
