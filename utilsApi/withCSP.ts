import { FC } from 'react';
import { AppProps } from 'next/app';
import getConfig from 'next/config';
import { withSecureHeaders } from 'next-secure-headers';

import { dynamics } from 'config';
import type { ContentSecurityPolicyOption } from 'next-secure-headers/lib/rules';

const { serverRuntimeConfig } = getConfig();
const { cspTrustedHosts, cspReportOnly, cspReportUri, developmentMode } =
  serverRuntimeConfig;

const trustedHosts = cspTrustedHosts ? cspTrustedHosts.split(',') : [];

const reportOnly = cspReportOnly == 'true';

export const contentSecurityPolicy: ContentSecurityPolicyOption = {
  directives: {
    'default-src': ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    fontSrc: ["'self'", 'data:'],
    imgSrc: [
      "'self'",
      'data:',
      'https://*.walletconnect.org',
      'https://*.walletconnect.com',
    ],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      ...(developmentMode ? ["'unsafe-eval'"] : []), // for HMR
      ...trustedHosts,
    ],

    // Allow fetch connections to any secure host
    connectSrc: [
      "'self'",
      'https:',
      'wss:',
      ...(developmentMode ? ['ws:'] : []), // for HMR
    ],

    ...(!dynamics.ipfsMode && {
      // CSP directive 'frame-ancestors' is ignored when delivered via a <meta> element.
      // CSP directive 'report-uri' is ignored when delivered via a <meta> element.
      frameAncestors: ['*'],
      reportURI: cspReportUri,
    }),
    childSrc: [
      "'self'",
      'https://*.walletconnect.org',
      'https://*.walletconnect.com',
    ],
    workerSrc: ["'none'"],
    'base-uri': dynamics.ipfsMode ? undefined : ["'none'"],
  },
  reportOnly,
};

export const withCsp = (app: FC<AppProps>): FC =>
  withSecureHeaders({
    contentSecurityPolicy,
    frameGuard: false,
    referrerPolicy: 'same-origin',
  })(app);
