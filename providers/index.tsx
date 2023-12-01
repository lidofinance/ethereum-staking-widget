import { FC, PropsWithChildren } from 'react';
import { ThemeProvider } from './theme';
import { GlobalStyle } from 'styles';

import { ClientConfigProvider } from './client-config';
import ModalProvider from './modals';
import Web3Provider from './web3';
import { AppFlagProvider } from './app-flag';

export { MODAL, ModalContext } from './modals';

export const Providers: FC<PropsWithChildren> = ({ children }) => (
  <ClientConfigProvider>
    <AppFlagProvider>
      <ThemeProvider>
        <GlobalStyle />
        <Web3Provider>
          <ModalProvider>{children}</ModalProvider>
        </Web3Provider>
      </ThemeProvider>
    </AppFlagProvider>
  </ClientConfigProvider>
);
