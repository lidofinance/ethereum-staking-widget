import { VaultWarning } from 'features/earn/shared/vault-warning';

const WARNING_TEXT: Record<string, string> = {
  'deposit-paused': 'Deposits are currently paused. Please try again later.',
  deprecated: 'This vault is no longer accepting new deposits.',
};

type VaultDepositWarningProps = {
  isVaultAvailable: boolean;
  isDepositEnabled: boolean;
  isVaultDeprecated?: boolean;
  depositPauseReasonText?: string;
};

export const VaultDepositWarning = ({
  isVaultAvailable,
  isDepositEnabled,
  isVaultDeprecated,
  depositPauseReasonText,
}: VaultDepositWarningProps) => {
  // Without this check, the warning can be displayed even if the vault is generally disabled
  if (!isVaultAvailable) return null;

  if (isDepositEnabled) return null;

  let reason = 'deposit-paused';
  if (isVaultDeprecated) reason = 'deprecated';

  const message = depositPauseReasonText || WARNING_TEXT[reason];
  if (!message) return null;

  return <VaultWarning>{message}</VaultWarning>;
};
