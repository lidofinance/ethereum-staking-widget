import { memo } from 'react';
import NextApp, { AppProps, AppContext } from 'next/app';
import { ToastContainer } from '@lidofinance/lido-ui';
import { STORAGE_THEME_AUTO_KEY, STORAGE_THEME_MANUAL_KEY } from 'config';
import Providers, { EnvConfig } from 'providers';
import getConfig from 'next/config';
import { nprogress, getFromRawCookies } from 'utils';
import { CookiesTooltip } from 'shared/components';
import 'nprogress/nprogress.css';
import { withCsp } from 'utilsApi/withCsp';

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
      cookiesAutoThemeScheme={props.pageProps.cookiesAutoThemeScheme}
      cookiesManualThemeScheme={props.pageProps.cookiesManualThemeScheme}
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

  // Get current color theme preferences from req headers cookies
  appProps.pageProps.cookiesAutoThemeScheme = getFromRawCookies(
    appContext?.ctx?.req?.headers?.cookie,
    STORAGE_THEME_AUTO_KEY,
  );
  appProps.pageProps.cookiesManualThemeScheme = getFromRawCookies(
    appContext?.ctx?.req?.headers?.cookie,
    STORAGE_THEME_MANUAL_KEY,
  );

  return { ...appProps, config: publicRuntimeConfig };
};

export default process.env.NODE_ENV === 'development'
  ? AppWrapper
  : withCsp(AppWrapper);
