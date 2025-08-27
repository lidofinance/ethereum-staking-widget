import { FC, PropsWithChildren } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { GlobalStyle } from 'styles';
import { ConfigProvider } from 'config';

import { Web3Provider } from 'modules/web3';
import { AddressValidationFile } from 'utils/address-validation';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

import { AppFlagProvider } from './app-flag';
import { IPFSInfoBoxStatusesProvider } from './ipfs-info-box-statuses';
import { InpageNavigationProvider } from './inpage-navigation';
import { ModalProvider } from './modal-provider';
import { ExternalForbiddenRouteProvider } from './external-forbidden-route';
import { AddressValidationProvider } from './address-validation-provider';

type ProvidersProps = {
  prefetchedManifest?: unknown;
  validationFile?: AddressValidationFile;
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
  validationFile,
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
                    <AddressValidationProvider validationFile={validationFile}>
                      {children}
                    </AddressValidationProvider>
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
