import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';
import { useDVVAvailable } from '../hooks/use-dvv-avaliable';

export const DVVWithdrawSubmitButton = () => {
  const { isDVVAvailable } = useDVVAvailable();

  return (
    <VaultSubmitButton isAvailable={isDVVAvailable}>Withdraw</VaultSubmitButton>
  );
};
