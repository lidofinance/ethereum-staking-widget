import { VaultWarning } from 'features/earn/shared/vault-warning';

type VaultWithdrawWarningProps = {
  isVaultAvailable: boolean;
  isWithdrawEnabled: boolean;
  withdrawPauseReasonText?: string;
};

export const VaultWithdrawWarning = ({
  isVaultAvailable,
  isWithdrawEnabled,
  withdrawPauseReasonText,
}: VaultWithdrawWarningProps) => {
  // Without this check, the warning can be displayed even if the vault is generally disabled
  if (!isVaultAvailable) return null;

  if (isWithdrawEnabled) return null;

  const message =
    withdrawPauseReasonText ||
    'Withdrawals are currently paused. Please try again later.';

  return <VaultWarning>{message}</VaultWarning>;
};
