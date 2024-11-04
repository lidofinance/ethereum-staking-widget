import styled from 'styled-components';
import { Button } from '@lidofinance/lido-ui';

export const ButtonStyle = styled((props) => <Button {...props} />)`
  background: var(--lido-color-backgroundSecondary);
  color: var(--lido-color-textSecondary);

  &:disabled {
    cursor: not-allowed;
    opacity: 1;
  }
`;
