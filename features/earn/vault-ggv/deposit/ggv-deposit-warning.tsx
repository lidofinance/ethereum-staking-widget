import { VaultWarning } from 'features/earn/shared/vault-warning';

import { useGGVDepositStatus } from './hooks/use-ggv-deposit-status';
import { useGGVAvailable } from '../hooks/use-ggv-available';

const WARNING_TEXT = {
  cap: 'Deposits are unavailable right now, the vault has reached its limit.',
  pause: 'Deposits are currently paused. Please try again later.',
};

export const GGVDepositWarning = () => {
  const { isGGVAvailable, isDepositEnabled } = useGGVAvailable();
  const { data: depositStatus } = useGGVDepositStatus();

  // Without this check, the warning can be displayed even if the vault is generally disabled
  if (!isGGVAvailable) return null;

  const showWarning = depositStatus?.canDeposit === false || !isDepositEnabled;
  if (!showWarning) return null;

  const reason = depositStatus?.reason ?? 'pause';

  const message = WARNING_TEXT[reason];
  if (!message) return null;

  return <VaultWarning>{message}</VaultWarning>;
};
