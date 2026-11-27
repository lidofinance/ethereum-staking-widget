import { SidePanelGlowEth, SidePanelGlowUsd } from 'assets/earn';

import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from '../../../consts';

export const GLOWS = {
  eth: SidePanelGlowEth,
  usd: SidePanelGlowUsd,
} as const;

export const ACTION_ITEMS = [
  {
    value: EARN_VAULT_DEPOSIT_SLUG,
    label: 'Deposit',
    dataTestId: { root: 'Deposit-switch' },
  },
  {
    value: EARN_VAULT_WITHDRAW_SLUG,
    label: 'Withdraw',
    dataTestId: { root: 'Withdraw-switch' },
  },
];
