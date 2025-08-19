import { VaultWarning } from 'features/earn/shared/vault-warning';
import { useDVVWithdrawLimit } from './hooks/use-dvv-withdraw-limit';

export const DVVWithdrawStatus = () => {
  const { data } = useDVVWithdrawLimit();

  if (data?.isWithdrawalPaused) {
    return <VaultWarning>Withdrawals are currently paused.</VaultWarning>;
  }

  return null;
};
