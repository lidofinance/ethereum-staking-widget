import { FC } from 'react';
import { CookieThemeProvider } from '@lidofinance/lido-ui';
import { GlobalStyle } from 'styles';

import ModalProvider from './modals';
import { ThemeName } from './theme';
import Web3Provider, { EnvConfig } from './web3';

export type ProvidersProps = {
  cookiesAutoThemeScheme?: ThemeName;
  cookiesManualThemeScheme?: ThemeName;
  config: EnvConfig;
};

const Providers: FC<ProvidersProps> = ({ config, children }) => (
  <CookieThemeProvider>
    <GlobalStyle />
    <Web3Provider config={config}>
      <ModalProvider>{children}</ModalProvider>
    </Web3Provider>
  </CookieThemeProvider>
);

export default Providers;

export * from './modals';
export * from './theme';
export * from './web3';
