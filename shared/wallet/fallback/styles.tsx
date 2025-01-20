import { Button } from '@lidofinance/lido-ui';
import { Card } from 'shared/wallet';
import styled from 'styled-components';

export const FallbackWalletStyle = styled((props) => <Card {...props} />)`
  text-align: center;
  background: #7a8aa0;
  background-image: none !important;
`;

export const TextStyle = styled.p`
  margin-bottom: 16px;
`;

export const ButtonStyle = styled((props) => <Button {...props} />)`
  background: #ffffff1a;

  &:not(:disabled):hover {
    background: #ffffff66;
  }
`;
