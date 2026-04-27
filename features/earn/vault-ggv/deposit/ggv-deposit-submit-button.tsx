import { useFormState } from 'react-hook-form';
import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';
import { useGGVAvailable } from '../hooks/use-ggv-available';

export const GGVDepositSubmitButton = () => {
  const { isGGVAvailable } = useGGVAvailable();
  const { disabled } = useFormState();

  return (
    <VaultSubmitButton disabled={disabled} isAvailable={isGGVAvailable}>
      Deposit
    </VaultSubmitButton>
  );
};
