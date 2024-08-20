import { FC } from 'react';
import { ThemeProvider, themeDark } from '@lidofinance/lido-ui';

import {
  WalletStyle,
  WalletContentStyle,
  // WalletContentAddressBadgeStyle,
  // WalletContentRowStyle,
} from './styles';

export const Wallet: FC = () => {
  return (
    <WalletStyle>
      <ThemeProvider theme={themeDark}>
        <WalletContentStyle>123</WalletContentStyle>
      </ThemeProvider>
    </WalletStyle>
  );
};
