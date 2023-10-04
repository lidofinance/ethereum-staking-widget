import { memo } from 'react';
import NextApp, { AppProps, AppContext } from 'next/app';
import {
  ToastContainer,
  CookiesTooltip,
  migrationAllowCookieToCrossDomainCookieClientSide,
  migrationThemeCookiesToCrossDomainCookiesClientSide,
} from '@lidofinance/lido-ui';
import 'nprogress/nprogress.css';

import { dynamics } from 'config';
import Providers from 'providers';
import { CustomConfigProvider } from 'providers/custom-config';
import { BackgroundGradient } from 'shared/components/background-gradient/background-gradient';
import { nprogress, COOKIES_ALLOWED_FULL_KEY } from 'utils';
import { parseEnvConfig } from 'utils/parse-env-config';
import { withCsp } from 'utilsApi/withCSP';
import { AppWrapperProps } from 'types';

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

const AppWrapper = (props: AppWrapperProps): JSX.Element => {
  const { envConfig, ...rest } = props;

  return (
    <CustomConfigProvider envConfig={envConfig}>
      <Providers>
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
    </CustomConfigProvider>
  );
};

AppWrapper.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    envConfig: parseEnvConfig(dynamics),
  };
};

export default process.env.NODE_ENV === 'development'
  ? AppWrapper
  : withCsp(AppWrapper);
