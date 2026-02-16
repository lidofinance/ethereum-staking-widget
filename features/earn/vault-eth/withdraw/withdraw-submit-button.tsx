import React from 'react';
import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';
import { useEthVaultAvailable } from '../hooks/use-vault-available';

export const EthVaultWithdrawSubmitButton: React.FC = () => {
  const { isEthVaultAvailable } = useEthVaultAvailable();
  return (
    <VaultSubmitButton isAvailable={isEthVaultAvailable}>
      Request withdrawal
    </VaultSubmitButton>
  );
};
