import { VaultWarning } from 'features/earn/shared/vault-warning';
import { useGGVWithdrawForm } from './form-context';
import { GGVWithdrawStoppedReason } from './types';
import { useGGVAvailable } from '../hooks/use-ggv-available';

const WARNING_TEXT: Record<NonNullable<GGVWithdrawStoppedReason>, string> = {
  paused: 'Withdrawals are currently paused. Please try again later.',
  'withdrawal-stopped':
    'Withdrawals are currently paused. Please try again later.',
  'withdrawal-zero-capacity':
    'The vault currently has no capacity for wstETH withdrawals.',
  'transfer-from-shares-blocked': 'You are not allowed to transfer shares.',
  'transfer-from-shares-time-locked':
    'Recent deposits can’t be withdrawn the first 24 hours, please wait until',
};

export const GGVWithdrawWarning = () => {
  const { isWithdrawEnabled } = useGGVAvailable();
  const { reason: contractReason, unlockTime } = useGGVWithdrawForm();

  const reason = isWithdrawEnabled ? contractReason : 'paused';

  if (reason) {
    return (
      <VaultWarning>
        {WARNING_TEXT[reason]}
        {unlockTime && ` ${unlockTime.toString()}.`}
      </VaultWarning>
    );
  }

  return null;
};
