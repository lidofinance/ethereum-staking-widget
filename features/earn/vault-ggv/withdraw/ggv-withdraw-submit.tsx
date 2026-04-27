import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';

import { useGGVAvailable } from '../hooks/use-ggv-available';

export const GGVWithdrawSubmitButton = () => {
  const { isGGVAvailable, isWithdrawEnabled } = useGGVAvailable();

  return (
    <VaultSubmitButton
      disabled={!isWithdrawEnabled}
      isAvailable={isGGVAvailable}
    >
      Withdraw
    </VaultSubmitButton>
  );
};
