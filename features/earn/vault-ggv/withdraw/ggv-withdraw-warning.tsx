import { VaultWarning } from 'features/earn/shared/vault-warning';
import { LOCALE } from 'config/groups/locale';

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
  const { isGGVAvailable, isWithdrawEnabled } = useGGVAvailable();
  const { reason: contractReason, unlockTime } = useGGVWithdrawForm();

  // Without this check, the warning can be displayed even if the vault is generally disabled
  if (!isGGVAvailable) return null;

  const reason = isWithdrawEnabled ? contractReason : 'paused';

  const message = reason ? WARNING_TEXT[reason] : null;
  if (!message) return null;

  return (
    <VaultWarning>
      {message}
      {unlockTime &&
        reason === 'transfer-from-shares-time-locked' &&
        ` ${unlockTime.toLocaleString(LOCALE, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}.`}
    </VaultWarning>
  );
};
