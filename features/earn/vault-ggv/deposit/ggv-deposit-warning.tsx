import { VaultWarning } from 'features/earn/shared/vault-warning';

import { useGGVDepositStatus } from './hooks/use-ggv-deposit-status';
import { useGGVAvailable } from '../hooks/use-ggv-available';

const WARNING_TEXT = {
  cap: 'Deposits are unavailable right now, the vault has reached its limit.',
  pause: 'Deposits are currently paused. Please try again later.',
};

export const GGVDepositWarning = () => {
  const { isDepositEnabled } = useGGVAvailable();
  const { data: depositStatus } = useGGVDepositStatus();

  const showWarning = depositStatus?.canDeposit === false || !isDepositEnabled;
  const reason = WARNING_TEXT[depositStatus?.reason ?? 'pause'];

  if (showWarning) {
    return <VaultWarning>{reason}</VaultWarning>;
  }

  return null;
};
