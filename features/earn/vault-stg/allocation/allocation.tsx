import { VaultAllocation } from 'features/earn/shared/vault-allocation/vault-allocation';
import { useSTGAllocation } from './hooks/use-stg-allocation';

const FOOTER_TEXT =
  'Data is provided by Mellow’s API and reflects the most recent snapshot at the time of update. As a result, the TVL shown here may differ from the vault’s TVL due to the data timestamp';

export const Allocation = () => {
  const { data, isLoading } = useSTGAllocation();

  return (
    <VaultAllocation data={data} isLoading={isLoading} footer={FOOTER_TEXT} />
  );
};
