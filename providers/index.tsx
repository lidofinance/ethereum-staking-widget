import { FC, PropsWithChildren } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';
import { QueryClientProvider } from '@tanstack/react-query';

import { GlobalStyle } from 'styles';
import { ConfigProvider } from 'config';

import { Web3Provider } from 'modules/web3';
import { AddressValidationFile } from 'utils/address-validation';

import { AppFlagProvider } from './app-flag';
import { IPFSInfoBoxStatusesProvider } from './ipfs-info-box-statuses';
import { InpageNavigationProvider } from './inpage-navigation';
import { ModalProvider } from './modal-provider';
import { ExternalForbiddenRouteProvider } from './external-forbidden-route';
import { AddressValidationProvider } from './address-validation-provider';
import { queryClient } from './query-client';

type ProvidersProps = {
  prefetchedManifest?: unknown;
  validationFile?: AddressValidationFile;
};

export const Providers: FC<PropsWithChildren<ProvidersProps>> = ({
  children,
  prefetchedManifest,
  validationFile,
}) => (
  <QueryClientProvider client={queryClient}>
    <AppFlagProvider>
      <ConfigProvider prefetchedManifest={prefetchedManifest}>
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
      </ConfigProvider>
    </AppFlagProvider>
  </QueryClientProvider>
);
