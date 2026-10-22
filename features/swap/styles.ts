import { Block } from '@lidofinance/lido-ui';
import styled from 'styled-components';

import { devicesHeaderMedia } from 'styles/global';

export const SwapBlock = styled(Block).attrs({ paddingLess: true })`
  padding: 0px;
  // CoW draws its own card, narrower than the iframe; the gap must not show
  background: transparent;
  // the page has no subtitle, keep its spacing under the title
  margin-top: 30px;

  @media ${devicesHeaderMedia.mobile} {
    margin-top: 20px;
  }
`;
