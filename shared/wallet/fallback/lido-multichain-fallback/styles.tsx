import { Button } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const TextStyle = styled.p`
  margin-bottom: 16px;
`;

export const ButtonStyle = styled((props) => <Button {...props} />)`
  background: #ffffff1a;

  &:not(:disabled):hover {
    background: #ffffff66;
  }
`;
