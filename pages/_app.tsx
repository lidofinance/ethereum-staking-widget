import { memo } from 'react';
import { AppProps } from 'next/app';
import 'nprogress/nprogress.css';
import Head from 'next/head';

import {
  ToastContainer,
  CookiesTooltip,
  migrationAllowCookieToCrossDomainCookieClientSide,
  migrationThemeCookiesToCrossDomainCookiesClientSide,
} from '@lidofinance/lido-ui';

import { dynamics } from 'config';
import { Providers } from 'providers';
import { BackgroundGradient } from 'shared/components/background-gradient/background-gradient';
import { nprogress, COOKIES_ALLOWED_FULL_KEY } from 'utils';
import { withCsp } from 'utilsApi/withCSP';
import { UpgradePromtBanner } from 'features/ipfs';

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
      {/* see https://nextjs.org/docs/messages/no-document-viewport-meta */}
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
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
      <UpgradePromtBanner />
    </Providers>
  );
};

export default dynamics.ipfsMode || process.env.NODE_ENV === 'development'
  ? AppWrapper
  : withCsp(AppWrapper);
