import { Block } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const SwapBlock = styled(Block).attrs({ paddingLess: true })`
  padding: 0px;
  // CoW draws its own card, narrower than the iframe; the gap must not show
  background: transparent;
`;
