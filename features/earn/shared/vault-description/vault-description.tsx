import React from 'react';
import { VaultDescriptionWrapper } from './styles';

export const VaultDescription: React.FC<{
  description?: string;
}> = ({ description }) => {
  return (
    <VaultDescriptionWrapper data-testid="vault-description">
      {description && <p>{description}</p>}
    </VaultDescriptionWrapper>
  );
};
