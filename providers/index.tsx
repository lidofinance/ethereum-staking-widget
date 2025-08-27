import { FC, PropsWithChildren } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { GlobalStyle } from 'styles';
import { ConfigProvider } from 'config';

import { Web3Provider } from 'modules/web3';

import { AppFlagProvider } from './app-flag';
import { IPFSInfoBoxStatusesProvider } from './ipfs-info-box-statuses';
import { InpageNavigationProvider } from './inpage-navigation';
import { ModalProvider } from './modal-provider';
import { ExternalForbiddenRouteProvider } from './external-forbidden-route';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

type ProvidersProps = {
  prefetchedManifest?: unknown;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...STRATEGY_LAZY,
    },
  },
});

export const Providers: FC<PropsWithChildren<ProvidersProps>> = ({
  children,
  prefetchedManifest,
}) => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider prefetchedManifest={prefetchedManifest}>
      <AppFlagProvider>
        <CookieThemeProvider>
          <GlobalStyle />
          <Web3Provider>
            <IPFSInfoBoxStatusesProvider>
              <InpageNavigationProvider>
                <ModalProvider>
                  <ExternalForbiddenRouteProvider>
                    {children}
                  </ExternalForbiddenRouteProvider>
                </ModalProvider>
              </InpageNavigationProvider>
            </IPFSInfoBoxStatusesProvider>
          </Web3Provider>
        </CookieThemeProvider>
      </AppFlagProvider>
    </ConfigProvider>
  </QueryClientProvider>
);
