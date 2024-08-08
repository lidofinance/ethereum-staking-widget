import styled from 'styled-components';
import { Button } from '@lidofinance/lido-ui';

export const ButtonStyle = styled(Button)`
  font-weight: 400;
  height: 32px;
  min-width: unset;
  padding: 0 15px;
  font-size: 12px;
  color: var(--lido-color-text);

  &::before {
    border-color: var(--lido-color-border);
  }
`;
