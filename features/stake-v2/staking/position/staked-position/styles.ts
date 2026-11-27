import {
  Description,
  IconChevronDown,
  Typography,
} from '@lidofinance/lido-app-ui';
import styled from 'styled-components';

import { motionFade } from '../../../utils';

import { cardButton, cardButtonInteractive } from '../styles';

export const PositionGrid = styled.button`
  ${cardButton}
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto;

  min-height: var(--lido-custom-position-block-min-height);

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

export const PositionTitle = styled(Description).attrs({
  color: 'secondary',
  weight: 'thin',
  as: 'span',
})`
  grid-column: 1;
  grid-row: 1;
  // Styled components won't apply the 'thin' weight correctly, so we enforce it with CSS
  font-weight: var(--lido-app-ui-font-weight-thin);
`;

export const PositionAmount = styled(Typography).attrs({
  variant: 'bodyLarge',
  weight: 'semibold',
  as: 'span',
})`
  grid-column: 1;
  grid-row: 2;
`;

export const PositionAPR = styled(Typography).attrs({
  variant: 'body',
  weight: 'semibold',
  color: 'default',
  as: 'span',
})`
  grid-column: 2;
  grid-row: 1 / 3;
  align-self: center;
`;
