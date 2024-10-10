import { Card } from 'shared/wallet';
import styled from 'styled-components';

interface StyledCardProps {
  $redBg?: boolean;
}

export const StyledCard = styled(Card)<StyledCardProps>`
  background: ${({ $redBg }) =>
    $redBg
      ? 'linear-gradient(52.01deg, #37394A 0%, #1D1E35 0.01%, #B73544 100%)'
      : 'linear-gradient(52.01deg, #1b3349 0%, #25697e 100%)'};
`;
