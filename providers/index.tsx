import { FC, PropsWithChildren } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';
import { GlobalStyle } from 'styles';

import ModalProvider from './modals';
import Web3Provider from './web3';
import { AppFlagProvider } from './app-flag';

export { MODAL, ModalContext } from './modals';

const Providers: FC<PropsWithChildren> = ({ children }) => (
  <AppFlagProvider>
    <CookieThemeProvider>
      <GlobalStyle />
      <Web3Provider>
        <ModalProvider>{children}</ModalProvider>
      </Web3Provider>
    </CookieThemeProvider>
  </AppFlagProvider>
);

export default Providers;
