import styled from 'styled-components';
import {
  Box,
  InlineLoader,
  Switcher,
  SwitcherItem,
} from '@lidofinance/lido-ui';

export const SwitcherWrapper = styled(Box)<{
  $isLoading?: boolean;
}>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    's1 . s2'
    'chart chart chart';
  row-gap: ${({ theme }) => theme.spaceMap.lg}px;

  & > :nth-child(1) {
    ${({ $isLoading }) =>
      $isLoading ? 'grid-column: 1 / -1; grid-row: 1;' : 'grid-area: s1;'}
  }

  & > :nth-child(2) {
    grid-area: chart;
  }

  & > :nth-child(3) {
    grid-area: s2;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spaceMap.lg}px;
  }
`;

export const SwitcherStyled = styled(Switcher)<{ $disabled?: boolean }>`
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
`;

export const SwitcherItemStyled = styled(SwitcherItem)`
  ${({ theme }) => theme.mediaQueries.md} {
    width: 100%;
  }
`;

export const ChartInlineLoaderStyled = styled(InlineLoader)`
  display: inline-block;
  width: 100%;
  height: 100%;
  border-radius: 10px;
`;

export const SwitchersInlineLoaderStyled = styled(InlineLoader)`
  display: inline-block;
  max-width: 244px;
  height: 28px;
  border-radius: 10px;
`;

export const ErrorMessageStyled = styled(Box)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: var(--lido-color-text);
  opacity: 0.5;
  background-color: ${({ theme }) =>
    theme.name === 'light' ? '#e1e4e8' : '#273852'};
  border-radius: 10px;
`;
