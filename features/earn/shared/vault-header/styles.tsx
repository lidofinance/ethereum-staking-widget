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
  display: flex;
  align-items: center;
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

export const VaultHeaderNewTag = styled.div`
  display: inline-block;
  height: 18px;
  margin-left: ${({ theme }) => theme.spaceMap.sm}px;
  padding: ${({ theme }) => theme.spaceMap.xs}px;
  line-height: 1;
  font-size: ${({ theme }) => theme.fontSizesMap.xxxs}px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  background-color: var(--lido-color-error);
  color: #ffffff;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.xs}px;
`;
