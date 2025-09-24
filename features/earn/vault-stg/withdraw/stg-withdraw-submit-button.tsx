import React from 'react';
import { VaultSubmitButton } from 'features/earn/shared/vault-submit-button';

export const STGWithdrawSubmitButton: React.FC = () => {
  // TODO: isAvailable logic
  return <VaultSubmitButton isAvailable>Request withdrawal</VaultSubmitButton>;
};
