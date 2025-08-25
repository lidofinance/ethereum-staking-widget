import { VaultWarning } from 'features/earn/shared/vault-warning';

import { useDVVDepositLimit } from './hooks/use-dvv-deposit-limit';
import { useDVVAvailable } from '../hooks/use-dvv-available';
import type { DVVDepositLimitReason } from './types';

const WARNING_TEXT: Record<DVVDepositLimitReason, string> = {
  'deposit-limit-reached':
    'Deposits are unavailable right now, the vault has reached its limit.',
  'deposit-paused': 'Deposits are currently paused. Please try again later.',
  'non-whitelisted': 'Your address is not whitelisted for deposits.',
};

export const DVVDepositWarning = () => {
  const { isDVVAvailable, isDepositEnabled } = useDVVAvailable();
  const { data } = useDVVDepositLimit();

  // Without this check, the warning can be displayed even if the vault is generally disabled
  if (!isDVVAvailable) return null;

  const reason = isDepositEnabled ? data?.reason : 'deposit-paused';
  if (!reason) return null;

  const message = WARNING_TEXT[reason as DVVDepositLimitReason];
  if (!message) return null;

  return <VaultWarning>{message}</VaultWarning>;
};
