import { memo } from 'react';
import NextApp, { AppProps, AppContext } from 'next/app';
import { STORAGE_CURRENCY_KEY } from 'config';
import getConfig from 'next/config';
import {
  ToastContainer,
  CookiesTooltip,
  migrationAllowCookieToCrossDomainCookieClientSide,
  migrationThemeCookiesToCrossDomainCookiesClientSide,
} from '@lidofinance/lido-ui';
import 'nprogress/nprogress.css';
import Providers, { EnvConfig } from 'providers';
import { nprogress, COOKIES_ALLOWED_FULL_KEY, getFromRawCookies } from 'utils';
import { withCsp } from 'utilsApi/withCsp';
import { BackgroundGradient } from 'shared/components/background-gradient/background-gradient';
import 'nprogress/nprogress.css';

// Migrations old theme cookies to new cross domain cookies
migrationThemeCookiesToCrossDomainCookiesClientSide();

// Migrations old allow cookies to new cross domain cookies
migrationAllowCookieToCrossDomainCookieClientSide(COOKIES_ALLOWED_FULL_KEY);

// Visualize route changes
nprogress();

const App = (props: AppProps) => {
  const { Component, pageProps } = props;

  return <Component {...pageProps} />;
};

const MemoApp = memo(App);

const AppWrapper = (props: AppProps & { config: EnvConfig }): JSX.Element => {
  const { config, ...rest } = props;

  return (
    <Providers
      config={config || {}}
      cookiesCurrency={props.pageProps.cookiesCurrency}
    >
      <BackgroundGradient
        width={1560}
        height={784}
        style={{
          opacity: 'var(--lido-color-darkThemeOpacity)',
        }}
      />
      <ToastContainer />
      <MemoApp {...rest} />
      <CookiesTooltip />
    </Providers>
  );
};

AppWrapper.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  const { publicRuntimeConfig } = getConfig();

  appProps.pageProps.cookiesCurrency = getFromRawCookies(
    appContext?.ctx?.req?.headers?.cookie,
    STORAGE_CURRENCY_KEY,
  );

  return { ...appProps, config: publicRuntimeConfig };
};

export default process.env.NODE_ENV === 'development'
  ? AppWrapper
  : withCsp(AppWrapper);
