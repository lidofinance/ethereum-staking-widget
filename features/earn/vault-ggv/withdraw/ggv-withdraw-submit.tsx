import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';

import { useGGVAvailable } from '../hooks/use-ggv-available';

export const GGVWithdrawSubmitButton = () => {
  const { isGGVAvailable } = useGGVAvailable();

  return (
    <VaultSubmitButton isAvailable={isGGVAvailable}>Withdraw</VaultSubmitButton>
  );
};
