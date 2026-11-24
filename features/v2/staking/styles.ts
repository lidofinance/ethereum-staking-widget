import styled from 'styled-components';

import { AnimatedCard } from '../animated-card';

// fixed to the Figma "Card big" width for now
export const StakingCard = styled(AnimatedCard)`
  && {
    width: 520px;
    max-width: 100%;
    height: 600px;
  }
`;
