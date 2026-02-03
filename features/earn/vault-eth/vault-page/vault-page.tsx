import type { FC } from 'react';

import { VaultEthIcon } from 'assets/earn-v2';
import { VaultPage } from 'features/earn/shared/v2/vault-page/vault-page';

const DATA = {
  title: 'Lido Earn ETH',
  description:
    'Lido Earn ETH vault utilizes tried and tested strategies with premier DeFi protocols for increased rewards on deposits of ETH or stETH.',
  apy: '8.4%',
  tvl: '$95.2M',
  upgradeAmount: '2.9831 GG',
  logo: VaultEthIcon,
} as const;

export const VaultPageETH: FC = () => {
  const data = DATA;

  return <VaultPage {...data} />;
};
