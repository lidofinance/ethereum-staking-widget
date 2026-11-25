import styled from 'styled-components';
import { Button, InlineLoader } from '@lidofinance/lido-ui';

export const WalletButtonStyle = styled((props) => <Button {...props} />)`
  flex-shrink: 1;
  min-width: unset;
  overflow: hidden;
  border-radius: 10px;

  ${({ $isAddPaddingLeft }) => ($isAddPaddingLeft ? `padding-left: 9px` : '')};
`;

export const WalletButtonWrapperStyle = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: -10px -18px;
`;

export const WalletButtonBalanceStyle = styled.span`
  margin-right: 12px;
  margin-left: 4px;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;

  ${({ theme }) => theme.mediaQueries.lg} {
    display: none;
  }
`;

export const WalletButtonLoaderStyle = styled((props) => (
  <InlineLoader {...props} />
))`
  width: 60px;
`;
