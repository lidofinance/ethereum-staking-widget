import { FC, PropsWithChildren } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';

import { GlobalStyle } from 'styles';
import { ConfigProvider } from 'config';

import { DappChainProvider } from './dapp-chain';
import { AppFlagProvider } from './app-flag';
import { IPFSInfoBoxStatusesProvider } from './ipfs-info-box-statuses';
import { InpageNavigationProvider } from './inpage-navigation';
import { ModalProvider } from './modal-provider';
import Web3Provider from './web3';
import { LidoSDKProvider } from './lido-sdk';

type ProvidersProps = {
  prefetchedManifest?: unknown;
};

export const Providers: FC<PropsWithChildren<ProvidersProps>> = ({
  children,
  prefetchedManifest,
}) => (
  <ConfigProvider prefetchedManifest={prefetchedManifest}>
    <AppFlagProvider>
      <DappChainProvider>
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
      </DappChainProvider>
    </AppFlagProvider>
  </ConfigProvider>
);
