import styled, { css, keyframes } from 'styled-components';
import { Button } from '@lidofinance/lido-ui';

import { ButtonInline } from 'shared/components/button-inline/button-inline';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const totalGradient = css`
  background: linear-gradient(143deg, #c9acff 7.44%, #6168fb 114.54%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
`;

export const SmartSuggestBlock = styled.div`
  padding: 17px 21px;
  border: 3px solid transparent;
  border-radius: 16px;
  /* Gradient border: the first layer fills the inner area, the second shows only under the border */
  background:
    linear-gradient(var(--lido-color-foreground), var(--lido-color-foreground))
      padding-box,
    linear-gradient(
        90deg,
        rgba(232, 192, 216, 0.9) 0%,
        rgba(201, 172, 255, 0.9) 25%,
        rgba(140, 157, 253, 0.9) 75%,
        rgba(157, 249, 249, 0.9) 100%
      )
      border-box;
  color: var(--lido-color-text);
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  line-height: 20px;
  animation: ${fadeIn} 250ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.sm}px;

  svg {
    flex-shrink: 0;
  }
`;

export const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 700;
  line-height: 20px;
`;

export const TotalInline = styled.span`
  ${totalGradient}
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 700;
`;

export const ToggleButton = styled(ButtonInline)<{ $isOpen: boolean }>`
  margin-left: auto;
  line-height: 20px;
  font-weight: ${({ $isOpen }) => ($isOpen ? 400 : 600)};
  color: ${({ $isOpen }) =>
    $isOpen ? 'var(--lido-color-textSecondary)' : 'var(--lido-color-primary)'};
`;

export const Collapse = styled.div<{ $isOpen: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isOpen }) => ($isOpen ? '1fr' : '0fr')};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition:
    grid-template-rows 200ms cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0s ${({ $isOpen }) => ($isOpen ? '0s' : '200ms')};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const CollapseInner = styled.div`
  min-height: 0;
  overflow: hidden;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.lg}px;
  padding-top: 14px;
`;

export const TotalRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
  color: var(--lido-color-textSecondary);
`;

export const TotalLarge = styled.span`
  ${totalGradient}
  font-size: ${({ theme }) => theme.fontSizesMap.xl}px;
  font-weight: 700;
  line-height: 38px;
`;

export const Divider = styled.hr`
  margin: 0;
  border: 0;
  border-top: 1px solid var(--lido-color-border);
`;

export const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 220px repeat(3, minmax(0, 1fr));
  grid-template-areas: 'token apy yield action';
  align-items: center;
  gap: 12px;

  ${({ theme }) => theme.mediaQueries.lg} {
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas:
      'token apy action'
      'yield yield yield';
    column-gap: ${({ theme }) => theme.spaceMap.sm}px;
    row-gap: 0;
  }
`;

export const TokenCell = styled.div`
  grid-area: token;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  min-width: 0;
  font-weight: 700;
  white-space: nowrap;

  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }
`;

export const ApyCell = styled.div`
  grid-area: apy;
  font-weight: 700;
  color: var(--lido-color-success);
  white-space: nowrap;
`;

export const YieldCell = styled.div`
  grid-area: yield;
  text-align: right;
  white-space: nowrap;

  ${({ theme }) => theme.mediaQueries.lg} {
    text-align: left;
  }
`;

export const ActionCell = styled.div`
  grid-area: action;
  justify-self: end;
`;

export const DepositButton = styled(Button)`
  && {
    padding: 8px 16px;
    font-weight: 700;
  }
`;
