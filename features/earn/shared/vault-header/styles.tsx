import styled, { css } from 'styled-components';

export const VaultCardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;

  & > svg {
    min-width: 52px;
  }
`;

export const VaultHeaderColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const VaultHeaderTitle = styled.div<{ compact?: boolean }>`
  color: var(--lido-color-text);
  font-size: ${({ theme }) => theme.fontSizesMap.xl}px;
  font-weight: 700;
  font-size: 26px;
  line-height: 1.4;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  }

  ${({ compact }) =>
    compact &&
    css`
      font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
      ${({ theme }) => theme.mediaQueries.md} {
        font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
      }
    `}
`;
