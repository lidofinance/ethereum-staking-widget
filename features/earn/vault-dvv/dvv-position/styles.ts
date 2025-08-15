import { Button } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const ClaimButton = styled(Button).attrs({
  variant: 'translucent',
  size: 'sm',
})`
  padding: 6px 16px;
  height: 32px;
  width: 90px;

  & > span {
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 4px;
    font-size: 12px;
    font-weight: 700;
    line-height: 20px;
  }
`;
