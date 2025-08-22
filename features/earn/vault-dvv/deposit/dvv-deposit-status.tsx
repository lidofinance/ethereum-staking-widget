import { VaultWarning } from 'features/earn/shared/vault-warning';

import { useDVVDepositLimit } from './hooks/use-dvv-deposit-limit';
import { useDVVAvailable } from '../hooks/use-dvv-avaliable';
import type { DVVDepositLimitReason } from './types';

const WARNING_TEXT: Record<DVVDepositLimitReason, string> = {
  'deposit-limit-reached':
    'Deposits are unavailable right now, the vault has reached its limit.',
  'deposit-paused': 'Deposits are currently paused. Please try again later.',
  'non-whitelisted': 'Your address is not whitelisted for deposits.',
};

export const DVVDepositWarning = () => {
  const { isDepositEnabled } = useDVVAvailable();
  const { data } = useDVVDepositLimit();

  const reason = isDepositEnabled ? data?.reason : 'deposit-paused';

  if (reason) {
    return <VaultWarning>{WARNING_TEXT[reason]}</VaultWarning>;
  }

  return null;
};
