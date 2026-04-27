import React from 'react';
import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';
import { useUsdVaultAvailable } from '../hooks/use-vault-available';

export const UsdVaultWithdrawSubmitButton: React.FC = () => {
  const { isUsdVaultAvailable, isWithdrawEnabled } = useUsdVaultAvailable();
  return (
    <VaultSubmitButton
      disabled={!isWithdrawEnabled}
      isAvailable={isUsdVaultAvailable}
    >
      Request withdrawal
    </VaultSubmitButton>
  );
};
