import styled from 'styled-components';

export const VaultStatsWrapper = styled.div`
  display: flex;
  font-size: 16px;
  line-height: 24px;
`;
export const VaultStatsItem = styled.div`
  display: flex;
  margin-right: ${({ theme }) => theme.spaceMap.xl}px;
`;
export const VaultStatsLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
  color: var(--lido-color-textSecondary);
  margin-right: ${({ theme }) => theme.spaceMap.xs}px;
`;
export const VaultStatsValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  font-weight: 700;
  color: var(--lido-color-text);
`;
