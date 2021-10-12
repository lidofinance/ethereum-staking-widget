import { Router } from 'next/router';
import nProgress from 'nprogress';

export const nprogress = (): void => {
  // Progress bar on route change
  nProgress.configure({ showSpinner: false });

  Router.events.on(
    'routeChangeStart',
    (_, { shallow }) => !shallow && nProgress.start(),
  );

  Router.events.on(
    'routeChangeComplete',
    (_, { shallow }) => !shallow && nProgress.done(),
  );

  Router.events.on(
    'routeChangeError',
    (_, { shallow }) => !shallow && !nProgress.done(),
  );
};
