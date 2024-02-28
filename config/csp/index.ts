import { FC } from 'react';
import { AppProps } from 'next/app';
import { withSecureHeaders } from 'next-secure-headers';
import type { ContentSecurityPolicyOption } from 'next-secure-headers/lib/rules';

// Not use absolute import here!
// code'''
//    import { getConfig } from 'config';
// '''
import { getConfig } from '../get-config';
const {
  cspTrustedHosts,
  cspReportOnly,
  cspReportUri,
  developmentMode,
  ipfsMode,
} = getConfig();

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
    scriptSrc: ["'self'", "'unsafe-inline'", ...trustedHosts],

    // Allow fetch connections to any secure host
    connectSrc: [
      "'self'",
      'https:',
      'wss:',
      // for HMR
      ...(developmentMode ? ['ws:'] : []),
    ],

    ...(!ipfsMode && {
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
    'base-uri': ["'none'"],
  },
  reportOnly,
};

export const withCsp = (app: FC<AppProps>): FC =>
  withSecureHeaders({
    contentSecurityPolicy,
    frameGuard: false,
    referrerPolicy: 'same-origin',
  })(app);
