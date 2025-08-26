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
    gap: ${({ theme }) => theme.spaceMap.xs}px;
    font-size: ${({ theme }) => theme.fontSizesMap.xxs}px !important;
    font-weight: 700;
    line-height: 20px;

    & > svg {
      padding: 0px 5px;
    }
  }
`;
