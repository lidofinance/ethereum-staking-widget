import { VaultWarning } from 'features/earn/shared/vault-warning';
import { useDVVWithdrawLimit } from './hooks/use-dvv-withdraw-limit';
import { useDVVAvailable } from '../hooks/use-dvv-available';

export const DVVWithdrawWarning = () => {
  const { isDVVAvailable, isWithdrawEnabled } = useDVVAvailable();
  const { data } = useDVVWithdrawLimit();

  // Without this check, the warning can be displayed even if the vault is generally disabled
  if (!isDVVAvailable) return null;

  const showWarning = data?.isWithdrawalPaused || !isWithdrawEnabled;
  if (!showWarning) return null;

  return (
    <VaultWarning>
      Withdrawals are currently paused. Please try again later.
    </VaultWarning>
  );
};
