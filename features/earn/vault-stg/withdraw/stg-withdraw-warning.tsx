import { VaultWarning } from 'features/earn/shared/vault-warning';
import { useSTGAvailable } from '../hooks/use-stg-available';

export const STGWithdrawWarning = () => {
  const { isSTGAvailable, isWithdrawEnabled, withdrawPauseReasonText } =
    useSTGAvailable();

  // Without this check, the warning can be displayed even if the vault is generally disabled
  if (!isSTGAvailable) return null;

  const showWarning = !isWithdrawEnabled;
  if (!showWarning) return null;

  const WARNING_TEXT =
    withdrawPauseReasonText ||
    'Withdrawals are currently paused. Please try again later.';

  return <VaultWarning>{WARNING_TEXT}</VaultWarning>;
};
