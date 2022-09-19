import { FC } from 'react';
import { AppProps } from 'next/app';
import { ToastContainer } from '@lidofinance/lido-ui';
import Providers from 'providers';
import { nprogress } from 'utils';
import { CookiesTooltip } from 'shared/components';
import 'nprogress/nprogress.css';
import { withCsp } from 'utilsApi/withCsp';
import { ThemedBackgroundGradient } from '../shared/components/background-gradient/themed-background-gradient';

// Visualize route changes
nprogress();

const AppWrapper: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <Providers>
      <ThemedBackgroundGradient />
      <ToastContainer />
      <Component {...pageProps} />
      <CookiesTooltip />
    </Providers>
  );
};

export default process.env.NODE_ENV === 'development'
  ? AppWrapper
  : withCsp(AppWrapper);
