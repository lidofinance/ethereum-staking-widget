import React from 'react';
import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';
import { useSTGAvailable } from '../hooks/use-stg-available';

export const STGWithdrawSubmitButton: React.FC = () => {
  const { isSTGAvailable } = useSTGAvailable();
  return (
    <VaultSubmitButton isAvailable={isSTGAvailable}>
      Request withdrawal
    </VaultSubmitButton>
  );
};
