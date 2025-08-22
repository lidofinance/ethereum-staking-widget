import { VaultWarning } from 'features/earn/shared/vault-warning';
import { useDVVWithdrawLimit } from './hooks/use-dvv-withdraw-limit';
import { useDVVAvailable } from '../hooks/use-dvv-avaliable';

export const DVVWithdrawStatus = () => {
  const { isWithdrawEnabled } = useDVVAvailable();
  const { data } = useDVVWithdrawLimit();

  if (data?.isWithdrawalPaused || !isWithdrawEnabled) {
    return (
      <VaultWarning>
        Withdrawals are currently paused. Please try again later.
      </VaultWarning>
    );
  }

  return null;
};
