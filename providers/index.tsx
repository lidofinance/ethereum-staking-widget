import { FC } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';
import { GlobalStyle } from 'styles';

import ModalProvider from './modals';
import CurrencyProvider from './currency';
import Web3Provider from './web3';

export * from './currency';
export { MODAL, ModalContext } from './modals';

export type ProvidersProps = {
  cookiesCurrency?: string;
};

const Providers: FC<ProvidersProps> = ({ cookiesCurrency, children }) => (
  <CookieThemeProvider>
    <CurrencyProvider cookiesCurrency={cookiesCurrency}>
      <GlobalStyle />
      <Web3Provider>
        <ModalProvider>{children}</ModalProvider>
      </Web3Provider>
    </CurrencyProvider>
  </CookieThemeProvider>
);

export default Providers;
