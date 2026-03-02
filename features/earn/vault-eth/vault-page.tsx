import type { FC } from 'react';

import { VaultEthIcon } from 'assets/earn-v2';
import { VaultPage } from 'features/earn/shared/v2/vault-page/vault-page';

import { EthVaultPositionManager } from './position-manager/position-manager';

import { EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_WITHDRAW_SLUG } from '../consts';

const DATA = {
  title: 'Lido Earn ETH',
  description:
    'Lido Earn ETH vault utilizes tried and tested strategies with premier DeFi protocols for increased rewards on deposits of ETH or stETH.',
  apy: '8.4%',
  tvl: '$95.2M',
  logo: VaultEthIcon,
} as const;

export const EthVaultPage: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const data = DATA;

  return (
    <VaultPage
      {...data}
      sidePanel={<EthVaultPositionManager action={action} />}
      vaultName="ethVault"
    />
  );
};
