import { Button } from '@lidofinance/lido-ui';
import { Card } from 'shared/wallet';
import styled from 'styled-components';

export const L2FallbackWalletStyle = styled((props) => <Card {...props} />)`
  text-align: center;
  background: linear-gradient(
    180deg,
    #6562ff 11.28%,
    #00a3ff 61.02%,
    #63d6d2 100%
  );
`;

export const TextStyle = styled.p`
  margin-bottom: 16px;
`;

export const ButtonStyle = styled((props) => <Button {...props} />)`
  background: #ffffff1a;

  &:not(:disabled):hover {
    // TODO
    background: #ffffff1a;
  }
`;
