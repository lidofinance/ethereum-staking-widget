import styled, { css } from 'styled-components';

export const PositionContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spaceMap.md}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  gap: ${({ theme }) => theme.spaceMap.lg}px;
  background-color: ${({ theme }) =>
    theme.name === 'light' ? `#F6F7F8` : 'var(--lido-color-controlBg)'};

  ${({ theme }) => theme.mediaQueries.md} {
    padding: 12px;
  }
`;

export const PositionEntry = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const PositionEntryTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-style: normal;
  font-weight: 400;

  & > svg {
    width: 20px;
    height: 20px;
    aspect-ratio: 1/1;
    vertical-align: bottom;
  }
`;

export const PositionEntryBody = styled.div<{
  compact?: boolean;
}>`
  display: grid;
  gap: 0px 8px;
  grid-template-rows: 24px 20px;
  grid-template-columns: 28px auto min-content;

  ${({ compact }) =>
    compact &&
    css`
      grid-template-rows: 28px 0px;
    `}
`;

export const PositionIcon = styled.div`
  width: 28px;
  height: 28px;
  grid-row: 1 / span 2;
  align-self: center;

  & > svg {
    width: 100%;
    height: 100%;
    aspect-ratio: 1/1;
  }
`;

export const PositionSubBalance = styled.div`
  grid-row: 2;
  grid-column: 2;
`;

export const PositionBalance = styled.div`
  grid-row: 1;
  grid-column: 2;
  color: var(--lido-color-text);
  font-size: 14px;
  font-weight: 700;
  line-height: 24px;

  :not(&:has(+ ${PositionSubBalance})) {
    grid-row: 1 / span 2;
    align-self: center;
  }
`;

export const PositionDecorator = styled.div`
  grid-row: 1 / span 2;
  grid-column: 3;
  align-self: center;
`;
