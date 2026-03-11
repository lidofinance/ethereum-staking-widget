import { VaultWarning } from 'features/earn/shared/vault-warning';

import { useGGVDepositStatus } from './hooks/use-ggv-deposit-status';
import { useGGVAvailable } from '../hooks/use-ggv-available';

const WARNING_TEXT: Record<string, string> = {
  cap: 'Deposits are unavailable right now, the vault has reached its limit.',
  pause: 'Deposits are currently paused. Please try again later.',
  deprecated: 'This vault is no longer accepting new deposits.',
};

export type GGVDepositLimitReason = keyof typeof WARNING_TEXT;

export const GGVDepositWarning = () => {
  const {
    isGGVAvailable,
    isDepositEnabled,
    isVaultDeprecated,
    depositPauseReasonText,
  } = useGGVAvailable();
  const { data: depositStatus } = useGGVDepositStatus();

  // Without this check, the warning can be displayed even if the vault is generally disabled
  if (!isGGVAvailable) return null;

  const showWarning = depositStatus?.canDeposit === false || !isDepositEnabled;
  if (!showWarning) return null;

  let reason: GGVDepositLimitReason = 'pause';
  reason = depositStatus?.reason ?? reason;
  if (isVaultDeprecated) reason = 'deprecated';

  const message = depositPauseReasonText || WARNING_TEXT[reason];
  if (!message) return null;

  return <VaultWarning>{message}</VaultWarning>;
};
