import { FC, PropsWithChildren } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';

import { GlobalStyle } from 'styles';
import { ConfigProvider } from 'config';

import { Web3Provider } from 'modules/web3';

import { AppFlagProvider } from './app-flag';
import { IPFSInfoBoxStatusesProvider } from './ipfs-info-box-statuses';
import { InpageNavigationProvider } from './inpage-navigation';
import { ModalProvider } from './modal-provider';

type ProvidersProps = {
  prefetchedManifest?: unknown;
};

export const Providers: FC<PropsWithChildren<ProvidersProps>> = ({
  children,
  prefetchedManifest,
}) => (
  <ConfigProvider prefetchedManifest={prefetchedManifest}>
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
  </ConfigProvider>
);
