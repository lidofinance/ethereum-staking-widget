import { memo } from 'react';
import NextApp, { AppProps, AppContext } from 'next/app';
import { ToastContainer } from '@lidofinance/lido-ui';
import { STORAGE_THEME_KEY } from 'config';
import Providers, { EnvConfig } from 'providers';
import getConfig from 'next/config';
import { nprogress, getFromRawCookies } from 'utils';
import { CookiesTooltip } from 'shared/components';
import 'nprogress/nprogress.css';

// Visualize route changes
nprogress();

const App = (props: AppProps): JSX.Element => {
  const { Component, pageProps } = props;

  return <Component {...pageProps} />;
};

const MemoApp = memo(App);

const AppWrapper = (props: AppProps & { config: EnvConfig }): JSX.Element => {
  const { config, ...rest } = props;

  return (
    <Providers
      config={config || {}}
      cookiesThemeScheme={props.pageProps.cookiesThemeScheme}
    >
      <ToastContainer />
      <MemoApp {...rest} />
      <CookiesTooltip />
    </Providers>
  );
};

AppWrapper.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  const { publicRuntimeConfig } = getConfig();

  // Get current color theme from req headers cookies
  appProps.pageProps.cookiesThemeScheme = getFromRawCookies(
    appContext?.ctx?.req?.headers?.cookie,
    STORAGE_THEME_KEY,
  );

  return { ...appProps, config: publicRuntimeConfig };
};

export default AppWrapper;
