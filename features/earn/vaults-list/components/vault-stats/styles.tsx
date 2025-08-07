import styled from 'styled-components';

export const VaultStatsWrapper = styled.div`
  display: flex;
  margin: ${({ theme }) => theme.spaceMap.md}px 0;
`;
export const VaultStatsItem = styled.div`
  display: flex;
  margin-right: ${({ theme }) => theme.spaceMap.xl}px;
`;
export const VaultStatsLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  color: var(--lido-color-textSecondary);
  margin-right: ${({ theme }) => theme.spaceMap.xs}px;
`;
export const VaultStatsValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  font-weight: 700;
  color: var(--lido-color-text);
`;
