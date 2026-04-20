import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';
import { useDVVAvailable } from '../hooks/use-dvv-available';

export const DVVWithdrawSubmitButton = () => {
  const { isDVVAvailable, isWithdrawEnabled } = useDVVAvailable();

  return (
    <VaultSubmitButton
      disabled={!isWithdrawEnabled}
      isAvailable={isDVVAvailable}
    >
      Withdraw
    </VaultSubmitButton>
  );
};
