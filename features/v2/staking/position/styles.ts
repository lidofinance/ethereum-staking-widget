import { Card, Typography } from '@lidofinance/lido-app-ui';
import styled from 'styled-components';

import { fadeIn, FadeInProps } from '../../utils';

export const BorderedCard = styled(Card).attrs({
  padding: 12,
})`
  min-height: 72px;

  border: 1px solid var(--lido-app-ui-color-border-default);
  border-radius: var(--lido-app-ui-border-radius-md);
  // horizontally combines with element padding 12 from attrs
  padding-inline: var(--lido-app-ui-space-4);
`;

export const UnconnectedText = styled(Typography).attrs({
  variant: 'body',
  weight: 'bold',
})<FadeInProps>`
  ${fadeIn}
`;

export const PositionGrid = styled.div<FadeInProps>`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto;

  ${fadeIn}
`;

export const PositionTitle = styled(Typography).attrs({
  variant: 'description',
})`
  grid-column: 1;
  grid-row: 1;
`;

export const PositionAmount = styled(Typography).attrs({
  variant: 'body',
  weight: 'bold',
})`
  grid-column: 1;
  grid-row: 2;
`;

export const PositionAPR = styled(Typography).attrs({
  variant: 'body',
  weight: 'bold',
})`
  grid-column: 2;
  grid-row: 1 / 3;
  align-self: center;
`;
