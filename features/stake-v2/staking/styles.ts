import styled from 'styled-components';

import { AnimatedCard } from '../animated-card';
import { IconShield } from '@lidofinance/lido-app-ui';

// fixed to the Figma "Card big" width for now
export const StakingCard = styled(AnimatedCard)`
  && {
    width: 520px;
    max-width: 100%;
  }
`;

export const TabsSizer = styled.div`
  width: 220px;
`;

export const InlineShieldIcon = styled(IconShield).attrs({
  width: 16,
  height: 16,
  'aria-hidden': 'true',
})`
  display: inline-block;
  width: 16px;
  height: 16px;
  vertical-align: -3px;
`;
