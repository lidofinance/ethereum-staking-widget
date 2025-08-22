import React from 'react';
import {
  VaultTokensWrapper,
  VaultTokensLabel,
  VaultTokensList,
  VaultToken,
  VaultTokenLogo,
  VaultTokenName,
} from './styles';

export const VaultTokens: React.FC<{
  tokens: Array<{ name: string; logo: React.ReactNode }>;
}> = ({ tokens }) => {
  return (
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
  );
};
