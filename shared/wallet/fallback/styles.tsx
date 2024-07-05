import { Card } from 'shared/wallet';
import styled from 'styled-components';

export const FallbackWalletStyle = styled((props) => <Card {...props} />)`
  text-align: center;
  background: #7a8aa0;
  background-image: none !important;
`;

export const TextStyle = styled.p``;
