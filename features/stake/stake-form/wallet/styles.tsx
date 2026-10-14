import { Card } from 'shared/wallet';
import styled from 'styled-components';

export const StyledCard = styled((props) => <Card {...props} />)`
  background: linear-gradient(65.21deg, #37394a 19.1%, #3e4b4f 100%);
`;

export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
`;
