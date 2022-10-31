import { FC } from 'react';
import { AppProps } from 'next/app';
import 'nprogress/nprogress.css';
import {
  ToastContainer,
  migrationThemeCookiesToCrossDomainCookiesClientSide,
} from '@lidofinance/lido-ui';
import Providers from 'providers';
import { nprogress } from 'utils';
import { withCsp } from 'utilsApi/withCsp';
import { CookiesTooltip } from 'shared/components';
import { BackgroundGradient } from 'shared/components/background-gradient/background-gradient';

// Migrations old cookies to new cross domain cookies
migrationThemeCookiesToCrossDomainCookiesClientSide();

// Visualize route changes
nprogress();

const AppWrapper: FC<AppProps> = ({ Component, pageProps }) => {
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
      <Component {...pageProps} />
      <CookiesTooltip />
    </Providers>
  );
};

export default process.env.NODE_ENV === 'development'
  ? AppWrapper
  : withCsp(AppWrapper);
