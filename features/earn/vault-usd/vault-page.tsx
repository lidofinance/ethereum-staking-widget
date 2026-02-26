import type { FC } from 'react';

import { VaultUsdIcon } from 'assets/earn-v2';
import { VaultPage } from 'features/earn/shared/v2/vault-page/vault-page';
import { UsdVaultPositionManager } from './position-manager/position-manager';
import { EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_WITHDRAW_SLUG } from '../consts';

const DATA = {
  title: 'Lido Earn USD',
  description:
    'Lido Earn USD Vault is curated for USD-denominated assets, designed to target an optimal risk-reward profile without compromising on security, risk controls, or asset quality.',
  apy: '6.4%',
  tvl: '$103.2M',
  logo: VaultUsdIcon,
} as const;

export const VaultPageUSD: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const data = DATA;

  return (
    <VaultPage
      {...data}
      sidePanel={<UsdVaultPositionManager action={action} />}
    />
  );
};
