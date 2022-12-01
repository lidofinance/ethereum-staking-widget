import { FC } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';
import { GlobalStyle } from 'styles';

import ModalProvider from './modals';
import CurrencyProvider from './currency';
import Web3Provider, { EnvConfig } from './web3';

export type ProvidersProps = {
  cookiesCurrency?: string;
  config: EnvConfig;
};

const Providers: FC<ProvidersProps> = ({
  config,
  cookiesCurrency,
  children,
}) => (
  <CookieThemeProvider>
    <CurrencyProvider cookiesCurrency={cookiesCurrency}>
      <GlobalStyle />
      <Web3Provider config={config}>
        <ModalProvider>{children}</ModalProvider>
      </Web3Provider>
    </CurrencyProvider>
  </CookieThemeProvider>
);

export default Providers;

export * from './modals';
export * from './theme';
export * from './web3';
export * from './currency';
