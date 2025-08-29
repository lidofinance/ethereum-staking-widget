import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';

import { useGGVAvailable } from '../hooks/use-ggv-available';

export const GGVDepositSubmitButton = () => {
  const { isGGVAvailable } = useGGVAvailable();

  return (
    <VaultSubmitButton isAvailable={isGGVAvailable}>Deposit</VaultSubmitButton>
  );
};
