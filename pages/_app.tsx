import { memo } from 'react';
import NextApp, { AppProps, AppContext } from 'next/app';
import {
  ToastContainer,
  migrationThemeCookiesToCrossDomainCookiesClientSide,
} from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/matomo';
import Providers from 'providers';
import { nprogress } from 'utils';
import { CookiesTooltip } from 'shared/components';
import 'nprogress/nprogress.css';
import { withCsp } from 'utilsApi/withCsp';
import { BackgroundGradient } from 'shared/components/background-gradient/background-gradient';
import { initMatomo, trackEvent } from 'matoma';

// Migrations old cookies to new cross domain cookies
migrationThemeCookiesToCrossDomainCookiesClientSide();

// Visualize route changes
nprogress();

initMatomo('https://matomo.testnet.fi/');

const App = (props: AppProps) => {
  const { Component, pageProps } = props;

  return <Component {...pageProps} />;
};

const MemoApp = memo(App);

const AppWrapper = (props: AppProps & { config: EnvConfig }): JSX.Element => {
  trackEvent('Ethereum_Stacking_Widget', 'Open app test', 'open_app_test');

  const { config, ...rest } = props;

  return (
    <Providers config={config || {}}>
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

  return { ...appProps, config: publicRuntimeConfig };
};

export default process.env.NODE_ENV === 'development'
  ? AppWrapper
  : withCsp(AppWrapper);
