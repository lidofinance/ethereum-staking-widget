import { FC, PropsWithChildren } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';

import { GlobalStyle } from 'styles';
import { ConfigProvider } from 'config';

import { AppFlagProvider } from './app-flag';
import { IPFSInfoBoxStatusesProvider } from './ipfs-info-box-statuses';
import { InpageNavigationProvider } from './inpage-navigation';
import { ModalProvider } from './modal-provider';
import Web3Provider from './web3';
import { LidoSDKProvider } from './lido-sdk';

export const Providers: FC<PropsWithChildren> = ({ children }) => (
  <ConfigProvider>
    <AppFlagProvider>
      <CookieThemeProvider>
        <GlobalStyle />
        <Web3Provider>
          <LidoSDKProvider>
            <IPFSInfoBoxStatusesProvider>
              <InpageNavigationProvider>
                <ModalProvider>{children}</ModalProvider>
              </InpageNavigationProvider>
            </IPFSInfoBoxStatusesProvider>
          </LidoSDKProvider>
        </Web3Provider>
      </CookieThemeProvider>
    </AppFlagProvider>
  </ConfigProvider>
);
