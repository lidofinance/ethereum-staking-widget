import { FC, PropsWithChildren } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';
import { GlobalStyle } from 'styles';

import { EnvConfigParsed } from '../config';
import { ClientConfigProvider } from './client-config';
import ModalProvider from './modals';
import Web3Provider from './web3';
import { AppFlagProvider } from './app-flag';

export { MODAL, ModalContext } from './modals';

export const Providers: FC<
  PropsWithChildren<{ envConfig: EnvConfigParsed }>
> = ({ envConfig, children }) => (
  <ClientConfigProvider envConfig={envConfig}>
    <AppFlagProvider>
      <CookieThemeProvider>
        <GlobalStyle />
        <Web3Provider>
          <ModalProvider>{children}</ModalProvider>
        </Web3Provider>
      </CookieThemeProvider>
    </AppFlagProvider>
  </ClientConfigProvider>
);
