import { Card, Typography } from '@lidofinance/lido-app-ui';
import styled, { css } from 'styled-components';

import { motionFade } from '../../utils';

export const BorderedCard = styled(Card).attrs({
  padding: 0,
  gap: 0,
  clip: true,
  align: 'stretch',
})`
  --lido-custom-position-block-min-height: 72px;

  border: 1px solid var(--lido-app-ui-color-border-default);
  border-radius: var(--lido-app-ui-border-radius-md);
`;

export const UnconnectedText = styled(Typography).attrs({
  variant: 'bodyLarge',
  weight: 'bold',
})`
  min-height: var(--lido-custom-position-block-min-height);
  display: flex;
  align-items: center;
  justify-self: center;
  gap: var(--lido-app-ui-space-12);
  padding-inline: var(--lido-app-ui-space-12);
  padding-block: var(--lido-app-ui-space-16);
  ${motionFade()}
`;

// full-width card row rendered as a button
export const cardButton = css`
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

export const cardButtonInteractive = css`
  cursor: pointer;

  &:hover {
    background-color: var(--lido-app-ui-color-background-default-hover);
  }

  &:active {
    background-color: var(--lido-app-ui-color-background-default-active);
  }
`;
