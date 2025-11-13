import { VaultAllocation } from 'features/earn/shared/vault-allocation/vault-allocation';
import { useGGVAllocation } from './hooks/useGGVAllocation';

import {
  AaveV3Icon,
  BalancerIcon,
  EtherfiIcon,
  EulerIcon,
  MerklIcon,
  MorphoIcon,
  Univ3Icon,
  YearnV3Icon,
} from 'assets/earn';

const FOOTER_TEXT =
  'Data is provided by Veda’s API and reflects the most recent snapshot at the time of update. As a result, the Total TVL shown here may differ from the vault’s TVL due to the data timestamp';

export const Allocation = () => {
  const { data, isLoading, apy } = useGGVAllocation();

  const protocolIcons = {
    'Aave V3': <AaveV3Icon />,
    Euler: <EulerIcon />,
    Morpho: <MorphoIcon />,
    'Uniswap V3': <Univ3Icon />,
    Balancer: <BalancerIcon />,
    Merkl: <MerklIcon />,
    'ether.fi': <EtherfiIcon />,
    'Yearn V3': <YearnV3Icon />,
  };

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
