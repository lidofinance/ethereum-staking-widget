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
    <VaultDescriptionWrapper>
      {description && <p>{description}</p>}
      {tokens && (
        <VaultTokensWrapper>
          <VaultTokensLabel>Tokens</VaultTokensLabel>
          <VaultTokensList>
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
