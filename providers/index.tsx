import { FC, PropsWithChildren } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';
import { GlobalStyle } from 'styles';

import { AppFlagProvider } from './app-flag';
import { OneConfigProvider } from './one-config';
import { ClientConfigProvider } from './client-config';
import { IPFSInfoBoxStatusesProvider } from './ipfs-info-box-statuses';
import { InpageNavigationProvider } from './inpage-navigation';
import ModalProvider from './modals';
import Web3Provider from './web3';

export { MODAL, ModalContext } from './modals';

export const Providers: FC<PropsWithChildren> = ({ children }) => (
  <OneConfigProvider>
    <ClientConfigProvider>
      <AppFlagProvider>
        <CookieThemeProvider>
          <GlobalStyle />
          <Web3Provider>
            <IPFSInfoBoxStatusesProvider>
              <InpageNavigationProvider>
                <ModalProvider>{children}</ModalProvider>
              </InpageNavigationProvider>
            </IPFSInfoBoxStatusesProvider>
          </Web3Provider>
        </CookieThemeProvider>
      </AppFlagProvider>
    </ClientConfigProvider>
  </OneConfigProvider>
);
