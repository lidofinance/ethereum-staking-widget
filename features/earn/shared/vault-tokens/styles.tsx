import styled from 'styled-components';

export const VaultTokensWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 12px 0 24px 0;
  line-height: 1;
`;

export const VaultTokensLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-right: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const VaultTokensList = styled.div`
  display: flex;
  align-items: center;
`;

export const VaultToken = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const VaultTokenLogo = styled.div`
  margin-right: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const VaultTokenName = styled.div`
  color: ${({ theme }) => theme.colors.text};
`;
