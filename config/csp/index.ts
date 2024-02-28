import { FC } from 'react';
import { AppProps } from 'next/app';
import { withSecureHeaders } from 'next-secure-headers';
import type { ContentSecurityPolicyOption } from 'next-secure-headers/lib/rules';

// Not use absolute import here!
// code'''
//    import { getConfig } from 'config';
//    import { getSecretConfig } from 'config';
//    or
//    import { config } from 'config';
//    import { secretConfig } from 'config';
// '''
import { config } from '../get-config';
import { secretConfig } from '../get-secret-config';

const trustedHosts = secretConfig.cspTrustedHosts
  ? secretConfig.cspTrustedHosts.split(',')
  : [];

const reportOnly = secretConfig.cspReportOnly == 'true';

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
      ...(secretConfig.developmentMode ? ['ws:'] : []),
    ],

    ...(!config.ipfsMode && {
      // CSP directive 'frame-ancestors' is ignored when delivered via a <meta> element.
      // CSP directive 'report-uri' is ignored when delivered via a <meta> element.
      frameAncestors: ['*'],
      reportURI: secretConfig.cspReportUri,
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
