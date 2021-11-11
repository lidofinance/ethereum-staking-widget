import { FC } from 'react';

import ModalProvider from './modals';
import ThemeProvider, { ThemeName } from './theme';
import Web3Provider, { EnvConfig } from './web3';

export type ProvidersProps = {
  cookiesThemeScheme: ThemeName;
  config: EnvConfig;
};

const Providers: FC<ProvidersProps> = ({
  cookiesThemeScheme,
  config,
  children,
}) => (
  <ThemeProvider cookiesThemeScheme={cookiesThemeScheme}>
    <Web3Provider config={config}>
      <ModalProvider>{children}</ModalProvider>
    </Web3Provider>
  </ThemeProvider>
);

export default Providers;

export * from './modals';
export * from './theme';
export * from './web3';
