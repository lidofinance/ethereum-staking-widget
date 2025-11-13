import styled from 'styled-components';

export const VaultTokensWrapper = styled.div`
  display: flex;
  align-items: center;

  line-height: 1;
`;

export const VaultTokensLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-right: ${({ theme }) => theme.spaceMap.sm}px;

  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }
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
  height: 20px;
  width: 20px;
  margin-right: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const VaultTokenName = styled.div`
  color: ${({ theme }) => theme.colors.text};
`;

export const VaultDescriptionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
