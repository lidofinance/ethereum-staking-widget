import { FC, PropsWithChildren } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';

import { GlobalStyle } from 'styles';
// import { UserConfigProvider } from 'config/user-config'; // TODO: or better 'config/user-config'
import { ConfigProvider, UserConfigProvider } from 'config';

import { AppFlagProvider } from './app-flag';
import { IPFSInfoBoxStatusesProvider } from './ipfs-info-box-statuses';
import { InpageNavigationProvider } from './inpage-navigation';
import ModalProvider from './modals';
import Web3Provider from './web3';

export { MODAL, ModalContext } from './modals';

export const Providers: FC<PropsWithChildren> = ({ children }) => (
  <ConfigProvider>
    <UserConfigProvider>
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
    </UserConfigProvider>
  </ConfigProvider>
);
