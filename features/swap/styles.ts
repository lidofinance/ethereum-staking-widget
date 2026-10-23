import { Block } from '@lidofinance/lido-ui';
import styled from 'styled-components';

import { devicesHeaderMedia } from 'styles/global';
import { Fallback } from 'shared/wallet/fallback/fallback';

// the CoW card is capped at this width and centered in its iframe
export const SWAP_CARD_MAX_WIDTH = 470;

export const SwapBlock = styled(Block).attrs({ paddingLess: true })`
  // CoW draws its own card, narrower than the iframe; the gap must not show
  background: transparent;
  // the page has no subtitle, keep its spacing under the title
  margin-top: 30px;

  @media ${devicesHeaderMedia.mobile} {
    margin-top: 20px;
  }
`;

export const SwapFallback = styled(Fallback)`
  max-width: ${SWAP_CARD_MAX_WIDTH}px;
  margin-left: auto;
  margin-right: auto;
`;
