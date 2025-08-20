import { VaultWarning } from 'features/earn/shared/vault-warning';
import { useGGVWithdrawForm } from './form-context';
import { GGVWithdrawStoppedReason } from './types';
import { useGGVAvailable } from '../hooks/use-ggv-available';

const WARNING_TEXT: Record<NonNullable<GGVWithdrawStoppedReason>, string> = {
  paused: 'The vault withdrawals are paused.',
  'withdrawal-stopped': 'The vault withdrawals have been stopped.',
  'withdrawal-zero-capacity':
    'The vault has zero capacity for wstETH withdrawals.',
  'transfer-from-shares-blocked':
    'You are restricted from transferring shares.',
  'transfer-from-shares-time-locked':
    'You cannot withdraw recent deposits until',
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
