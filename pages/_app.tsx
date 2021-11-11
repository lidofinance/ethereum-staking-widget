import { memo } from 'react';
import NextApp, { AppProps, AppContext } from 'next/app';
import { ToastContainer } from '@lidofinance/lido-ui';
import Providers, { EnvConfig } from 'providers';
import getConfig from 'next/config';
import { nprogress } from 'utils';
import { CookiesTooltip } from 'shared/components';
import 'nprogress/nprogress.css';

// Visualize route changes
nprogress();

const getCookie = (
  cookies: string | undefined,
  name: string,
): string | undefined => {
  if (!cookies) {
    return undefined;
  }

  const matches = cookies.match(
    /* eslint-disable */
    new RegExp(
      '(?:^|; )' +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
        '=([^;]*)',
    ),
    /* eslint-enable */
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

const App = (props: AppProps): JSX.Element => {
  const { Component, pageProps } = props;

  return <Component {...pageProps} />;
};

const MemoApp = memo(App);

const AppWrapper = (props: AppProps & { config: EnvConfig }): JSX.Element => {
  const { config, ...rest } = props;

  console.log('props ', props);

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

  console.log(
    'appContext?.ctx?.req?.headers?.cookie ',
    appContext?.ctx?.req?.headers?.cookie,
  );
  appProps.pageProps.cookiesThemeScheme = getCookie(
    appContext?.ctx?.req?.headers?.cookie,
    'lido-theme',
  );

  return { ...appProps, config: publicRuntimeConfig };
};

export default AppWrapper;
