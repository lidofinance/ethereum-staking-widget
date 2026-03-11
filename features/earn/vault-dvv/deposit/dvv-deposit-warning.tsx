import { VaultWarning } from 'features/earn/shared/vault-warning';

import { useDVVDepositLimit } from './hooks/use-dvv-deposit-limit';
import { useDVVAvailable } from '../hooks/use-dvv-available';

const WARNING_TEXT: Record<string, string> = {
  'deposit-limit-reached':
    'Deposits are unavailable right now, the vault has reached its limit.',
  'deposit-paused': 'Deposits are currently paused. Please try again later.',
  'non-whitelisted': 'Your address is not whitelisted for deposits.',
  deprecated: 'This vault is no longer accepting new deposits.',
};

export type DVVDepositLimitReason = keyof typeof WARNING_TEXT;

export const DVVDepositWarning = () => {
  const {
    isDVVAvailable,
    isDepositEnabled,
    isVaultDeprecated,
    depositPauseReasonText,
  } = useDVVAvailable();
  const { data } = useDVVDepositLimit();

  // Without this check, the warning can be displayed even if the vault is generally disabled
  if (!isDVVAvailable) return null;

  const showWarning = data?.reason != null || !isDepositEnabled;
  if (!showWarning) return null;

  let reason: DVVDepositLimitReason = 'deposit-paused';
  if (isDepositEnabled) reason = data?.reason ?? reason;
  if (isVaultDeprecated) reason = 'deprecated';

  const message = depositPauseReasonText || WARNING_TEXT[reason];
  if (!message) return null;

  return <VaultWarning>{message}</VaultWarning>;
};
