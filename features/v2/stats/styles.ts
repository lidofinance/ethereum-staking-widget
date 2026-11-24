import { Divider } from '@lidofinance/lido-app-ui';
import styled from 'styled-components';

import { fadeIn, FadeInProps } from '../utils';

export const StatsStack = styled.div<FadeInProps>`
  min-height: 24px;
  width: 100%;

  display: grid;
  /* 1fr keeps a min-content floor: equal columns while they fit,
     columns squeeze down to their content once the row gets too narrow */
  grid-template-columns: repeat(2, 1fr auto) 1fr;
  align-items: center;
  justify-items: center;
  column-gap: 5px;
  white-space: nowrap;

  ${fadeIn}
`;

export const GridDivivder = styled(Divider).attrs({
  orientation: 'vertical',
})``;
