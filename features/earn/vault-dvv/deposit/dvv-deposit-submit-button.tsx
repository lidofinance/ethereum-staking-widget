import { useFormState } from 'react-hook-form';

import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';

import { useDVVAvailable } from '../hooks/use-dvv-available';

export const DVVDepositSubmitButton = () => {
  const { isDVVAvailable } = useDVVAvailable();
  const { disabled } = useFormState();

  return (
    <VaultSubmitButton disabled={disabled} isAvailable={isDVVAvailable}>
      Deposit
    </VaultSubmitButton>
  );
};
