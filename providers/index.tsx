import { FC } from 'react';
import { GlobalStyle } from 'styles';

import ModalProvider from './modals';
import Web3Provider from './web3';
import { CookieThemeProvider } from '@lidofinance/lido-ui';
export { MODAL, ModalContext } from './modals';

const Providers: FC = ({ children }) => (
  <CookieThemeProvider>
    <GlobalStyle />
    <Web3Provider>
      <ModalProvider>{children}</ModalProvider>
    </Web3Provider>
  </CookieThemeProvider>
);

export default Providers;
