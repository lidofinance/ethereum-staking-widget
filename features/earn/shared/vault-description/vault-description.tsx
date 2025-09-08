import React from 'react';
import {
  VaultDescriptionWrapper,
  VaultTokensWrapper,
  VaultTokensLabel,
  VaultTokensList,
  VaultToken,
  VaultTokenLogo,
  VaultTokenName,
} from './styles';

export const VaultDescription: React.FC<{
  description?: string;
  tokens?: Array<{ name: string; logo: React.ReactNode }>;
}> = ({ description, tokens }) => {
  return (
    <VaultDescriptionWrapper data-testid="vault-description">
      {description && <p>{description}</p>}
      {tokens && (
        <VaultTokensWrapper>
          <VaultTokensLabel>Deposit tokens</VaultTokensLabel>
          <VaultTokensList data-testid="deposit-token-list">
            {tokens.map((token, index) => (
              <VaultToken key={index}>
                <VaultTokenLogo>{token.logo}</VaultTokenLogo>
                <VaultTokenName>{token.name}</VaultTokenName>
              </VaultToken>
            ))}
          </VaultTokensList>
        </VaultTokensWrapper>
      )}
    </VaultDescriptionWrapper>
  );
};
