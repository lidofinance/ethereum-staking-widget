import { VaultAllocation } from 'features/earn/shared/vault-allocation/vault-allocation';
import { useSTGAllocation } from './hooks/useSTGAllocation';

import { SparkIcon, AaveV3Icon } from 'assets/earn';

const FOOTER_TEXT =
  'Data is provided by Mellow’s API and reflects the most recent snapshot at the time of update. As a result, the Total TVL shown here may differ from the vault’s TVL due to the data timestamp';

export const Allocation = () => {
  const { data, isLoading, apy } = useSTGAllocation();

  const protocolIcons = {
    'Spark levered wstETH/ETH': <SparkIcon />,
    'Aave levered Ethena': <AaveV3Icon />,
    'Aave levered wstETH/ETH': <AaveV3Icon />,
  };

  if (!data?.allocations.length) return null;

  return (
    <VaultAllocation
      data={data}
      isLoading={isLoading}
      apy={apy}
      footer={FOOTER_TEXT}
      protocolIcons={protocolIcons}
    />
  );
};
