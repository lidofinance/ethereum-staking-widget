import { Card } from 'shared/wallet';
import styled from 'styled-components';

interface StyledCardProps {
  $optimism?: boolean;
  $soneium?: boolean;
}

export const StyledCard = styled(Card)<StyledCardProps>`
  background: ${({ $optimism, $soneium }) => {
    if ($optimism) {
      return 'linear-gradient(52.01deg, #37394A 0%, #1D1E35 0.01%, #B73544 100%)';
    }
    if ($soneium) {
      return 'linear-gradient(52.01deg, #9d1451 0.01%, #630876 100%);';
    }
    return 'linear-gradient(52.01deg, #1b3349 0%, #25697e 100%)';
  }};
`;
