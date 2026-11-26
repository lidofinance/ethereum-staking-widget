import { IconArrowRight, TextLink } from '@lidofinance/lido-app-ui';
import styled from 'styled-components';

import { motionCollapse } from '../../../utils';

import { cardButton, cardButtonInteractive } from '../styles';

export const WithdrawalsCollapse = styled.div`
  ${motionCollapse()}
  &[aria-hidden] {
    display: none;
  }
`;

// the single child motionCollapse clips
export const WithdrawalsClip = styled.div`
  display: flex;
  flex-direction: column;
`;

// the whole row is clickable through ArrowButton's overlay,
// so only the arrow is a focus / screen reader stop
export const WithdrawalsRow = styled.div`
  ${cardButton}
  ${cardButtonInteractive}
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--lido-app-ui-space-16);
`;

export const ArrowButton = styled.button`
  // removes default browser styles for button
  all: unset;
  display: flex;
  cursor: pointer;

  // stretches the hit area over the whole row
  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  &:focus-visible::after {
    outline: 2px solid var(--lido-app-ui-color-border-active);
    outline-offset: -2px;
  }
`;

// above ArrowButton's overlay, so the claim click stays its own
export const ClaimLink = styled(TextLink)`
  position: relative;
  z-index: 1;
`;

export const ArrowRight = styled(IconArrowRight).attrs({
  width: 16,
  height: 16,
  'aria-hidden': 'true',
})`
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--lido-app-ui-color-icons-secondary);
`;
