import {
  Card,
  IconArrowRight,
  IconChevronDown,
  Typography,
} from '@lidofinance/lido-app-ui';
import styled, { css } from 'styled-components';

import { motionCollapse, motionFade } from '../../utils';

export const BorderedCard = styled(Card).attrs({
  padding: 0,
  gap: 0,
  clip: true,
  align: 'stretch',
})`
  min-height: 76px;

  border: 1px solid var(--lido-app-ui-color-border-default);
  border-radius: var(--lido-app-ui-border-radius-md);
`;

export const UnconnectedText = styled(Typography).attrs({
  variant: 'body',
  weight: 'bold',
})`
  padding-inline: var(--lido-app-ui-space-12);
  padding-block: var(--lido-app-ui-space-16);
  ${motionFade()}
`;

const cardButton = css`
  // removes default browser styles for button
  all: unset;
  box-sizing: border-box;
  width: 100%;
  padding-inline: var(--lido-app-ui-space-16);
  padding-block: var(--lido-app-ui-space-12);

  &:focus-visible {
    outline: 2px solid var(--lido-app-ui-color-border-active);
    outline-offset: -2px;
  }
`;

const cardButtonInteractive = css`
  cursor: pointer;

  &:hover {
    background-color: var(--lido-app-ui-color-background-default-hover);
  }

  &:active {
    background-color: var(--lido-app-ui-color-background-default-active);
  }
`;

export const PositionGrid = styled.button`
  ${cardButton}
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto;

  &[data-clickable='true'] {
    ${cardButtonInteractive}

    &[data-toggled='true'] {
      background-color: var(--lido-app-ui-color-background-default-pressed);
    }
  }

  ${motionFade()}
`;

export const ChevronDown = styled(IconChevronDown).attrs({
  width: 12,
  height: 12,
  'aria-hidden': 'true',
})`
  display: inline-block;
  width: 12px;
  height: 12px;
  vertical-align: -1px;

  transition: transform var(--lido-app-ui-duration-base)
    var(--lido-app-ui-easing-move);
  &[data-toggled='true'] {
    transform: rotate(180deg);
  }
`;

export const PositionTitle = styled(Typography).attrs({
  variant: 'description',
  color: 'secondary',
})`
  grid-column: 1;
  grid-row: 1;
`;

export const PositionAmount = styled(Typography).attrs({
  variant: 'bodyLarge',
  weight: 'semibold',
})`
  grid-column: 1;
  grid-row: 2;
`;

export const PositionAPR = styled(Typography).attrs({
  variant: 'body',
  weight: 'semibold',
})`
  grid-column: 2;
  grid-row: 1 / 3;
  align-self: center;
`;

export const WithdrawalsCollapse = styled.div`
  ${motionCollapse()}
`;

// the single child motionCollapse clips
export const WithdrawalsClip = styled.div`
  display: flex;
  flex-direction: column;
`;

export const WithdrawalsButton = styled.button`
  ${cardButton}
  ${cardButtonInteractive}
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-16);
`;

export const WithdrawalsText = styled(Typography).attrs({
  variant: 'description',
  color: 'secondary',
})`
  flex: 1 1 auto;
  min-width: 0;
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
