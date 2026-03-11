import { VaultWarning } from 'features/earn/shared/vault-warning';
import { useSTGAvailable } from '../hooks/use-stg-available';

const WARNING_TEXT: Record<string, string> = {
  'deposit-paused': 'Deposits are currently paused. Please try again later.',
  deprecated: 'This vault is no longer accepting new deposits.',
};

export const STGDepositWarning = () => {
  const {
    isSTGAvailable,
    isDepositEnabled,
    isVaultDeprecated,
    depositPauseReasonText,
  } = useSTGAvailable();

  // Without this check, the warning can be displayed even if the vault is generally disabled
  if (!isSTGAvailable) return null;

  const showWarning = !isDepositEnabled;
  if (!showWarning) return null;

  let reason = 'deposit-paused';
  if (isVaultDeprecated) reason = 'deprecated';

  const message = depositPauseReasonText || WARNING_TEXT[reason];
  if (!message) return null;

  return <VaultWarning>{message}</VaultWarning>;
};
