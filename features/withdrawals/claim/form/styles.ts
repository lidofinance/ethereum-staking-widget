import styled, { css } from 'styled-components';
import { Block, Button } from '@lidofinance/lido-ui';

export const EditClaimButtonStyled = styled(Button)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;

export const ClaimFormBody = styled(Block)`
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`;

export const ClaimFooterBodyEnder = styled.div`
  --r: ${({ theme }) => theme.borderRadiusesMap.md}px;
  --r-1: ${({ theme }) => theme.borderRadiusesMap.md - 1}px;
  --g: #0000 98%, #000;
  /* It should be --lido-color-accentBorder, but it can't be used here because it has transparency */
  --border-color: var(--lido-color-foreground);

  position: absolute;
  display: block;
  top: calc((-1 * var(--r)));
  left: ${({ theme }) => theme.spaceMap.xxl}px;
  right: ${({ theme }) => theme.spaceMap.xxl}px;
  height: var(--r);
  mask-image: radial-gradient(var(--r-1) at var(--r) 0, var(--g));

  ${({ theme }) => theme.mediaQueries.md} {
    left: ${({ theme }) => theme.spaceMap.lg}px;
    right: ${({ theme }) => theme.spaceMap.lg}px;
  }

  & div:nth-child(1),
  & div:nth-child(2) {
    position: absolute;
    top: 0;
    width: var(--r);
    height: var(--r);
    background-color: var(--lido-color-foreground);
    &:after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: var(--r);
      height: var(--r);
      border-width: 1px;
      border-color: var(--border-color);
      border-style: solid;
    }
  }

  & div:nth-child(1) {
    left: 0;
    mask-image: radial-gradient(var(--r-1) at var(--r) 0, var(--g));
    &:after {
      border-top-width: 0;
      border-right-width: 0;
      border-bottom-left-radius: var(--r);
    }
  }

  & div:nth-child(2) {
    right: 0;
    mask-image: radial-gradient(var(--r-1) at 0 0, var(--g));
    &:after {
      border-top-width: 0;
      border-left-width: 0;
      border-bottom-right-radius: var(--r);
    }
  }

  & div:nth-child(3) {
    position: absolute;
    bottom: 0;
    right: var(--r);
    left: var(--r);
    height: 1px;
    background-color: var(--border-color);
  }
`;

export const ClaimFormFooterWrapper = styled.div<{ isSticked: boolean }>`
  position: ${({ isSticked }) => (isSticked ? 'sticky' : 'relative')};
  bottom: ${({ isSticked }) => (isSticked ? `60px` : '0px')};
  ${({ isSticked }) =>
    isSticked &&
    css`
      background-color: var(--lido-color-background);
    `}
`;

export const ClaimFormFooter = styled(Block)`
  position: relative;
  padding-top: ${({ theme }) => theme.spaceMap.lg}px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: var(--lido-color-foreground);
`;
