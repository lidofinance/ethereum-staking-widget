import styled, { css } from 'styled-components';

export const VaultStatsWrapper = styled.div<{ compact?: boolean }>`
  display: flex;
  font-size: 16px;
  line-height: 24px;

  font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  ${({ theme }) => theme.mediaQueries.md} {
    font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
  }

  ${({ compact }) =>
    compact &&
    css`
      font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
      ${({ theme }) => theme.mediaQueries.md} {
        font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
      }
    `}
`;
export const VaultStatsItem = styled.div`
  display: flex;
  margin-right: ${({ theme }) => theme.spaceMap.xl}px;
`;
export const VaultStatsLabel = styled.div`
  color: var(--lido-color-textSecondary);
  margin-right: ${({ theme }) => theme.spaceMap.xs}px;
`;
export const VaultStatsValue = styled.div`
  font-weight: 700;
  color: var(--lido-color-text);
`;
