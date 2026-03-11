import type { FC } from 'react';

import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { UsdVaultDepositForm } from '../deposit/deposit-form';
import { UsdVaultWithdrawForm } from '../withdraw/withdraw-form';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
  USD_DEPOSIT_PATH,
  USD_WITHDRAW_PATH,
} from '../../consts';
import { SwitchStyled } from './styles';
import { BlockSidePanel } from 'features/earn/shared/v2/block-side-panel/block-side-panel';

const routes = [
  {
    path: USD_DEPOSIT_PATH,
    name: 'Deposit',
    matomoEvent: MATOMO_EARN_EVENTS_TYPES.earnUsdDepositTab,
  },
  {
    path: USD_WITHDRAW_PATH,
    name: 'Withdraw',
    matomoEvent: MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalTab,
  },
];

export const UsdVaultPositionManager: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const isDeposit = action === EARN_VAULT_DEPOSIT_SLUG;
  const isWithdraw = action === EARN_VAULT_WITHDRAW_SLUG;
  return (
    <BlockSidePanel>
      <SwitchStyled routes={routes} checked={isWithdraw} fullwidth />
      {isDeposit && <UsdVaultDepositForm />}
      {isWithdraw && <UsdVaultWithdrawForm />}
    </BlockSidePanel>
  );
};
