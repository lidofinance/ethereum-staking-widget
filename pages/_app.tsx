import { memo } from 'react';
import { AppProps } from 'next/app';
import 'nprogress/nprogress.css';

import {
  ToastContainer,
  CookiesTooltip,
  migrationAllowCookieToCrossDomainCookieClientSide,
  migrationThemeCookiesToCrossDomainCookiesClientSide,
} from '@lidofinance/lido-ui';

import { getConfig } from 'config';
const { ipfsMode } = getConfig();

import { Providers } from 'providers';
import { BackgroundGradient } from 'shared/components/background-gradient/background-gradient';
import { nprogress, COOKIES_ALLOWED_FULL_KEY } from 'utils';
import { withCsp } from 'utilsApi/withCSP';

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

const AppWrapper = (props: AppProps): JSX.Element => {
  const { ...rest } = props;

  return (
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
  );
};

export default ipfsMode || process.env.NODE_ENV === 'development'
  ? AppWrapper
  : withCsp(AppWrapper);
