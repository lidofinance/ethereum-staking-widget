import { FC } from 'react';
import getConfig from 'next/config';
import { withSecureHeaders } from 'next-secure-headers';

import { dynamics } from 'config';
import { AppWrapperType } from 'types';

const { serverRuntimeConfig } = getConfig();
const { cspTrustedHosts, cspReportOnly, cspReportUri } = serverRuntimeConfig;

const trustedHosts = cspTrustedHosts ? cspTrustedHosts.split(',') : [];

const reportOnly = cspReportOnly == 'true';

export const contentSecurityPolicy = {
  directives: {
    styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', ...trustedHosts],
    imgSrc: [
      "'self'",
      'data:',
      'https://*.walletconnect.org',
      'https://*.walletconnect.com',
      ...trustedHosts,
    ],
    scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", ...trustedHosts],

    ...(dynamics.ipfsMode && {
      // connectSrc must be another for IPFS because of custom RPC
      connectSrc: ['https:', 'wss:'],
      // CSP directive 'frame-ancestors' is ignored when delivered via a <meta> element.
      // CSP directive 'report-uri' is ignored when delivered via a <meta> element.
    }),
    ...(!dynamics.ipfsMode && {
      connectSrc: [
        "'self'",
        'wss://*.walletconnect.org',
        'https://*.walletconnect.org',
        'wss://*.walletconnect.com',
        'https://*.walletconnect.com',
        'https://*.coinbase.com',
        'wss://*.walletlink.org/',
        'https://cloudflare-eth.com/',
        'https://rpc.ankr.com',
        'https://cdn.live.ledger.com/',
        'https://api-lido.1inch.io',
        'https://apiv5.paraswap.io/',
        'https://api.cow.fi/',
        ...trustedHosts,
      ],
      frameAncestors: ['*'],
      reportURI: cspReportUri,
    }),

    formAction: ["'self'", ...trustedHosts],
    manifestSrc: ["'self'", ...trustedHosts],
    mediaSrc: ["'self'", ...trustedHosts],
    childSrc: [
      "'self'",
      'https://*.walletconnect.org',
      'https://*.walletconnect.com',
      ...trustedHosts,
    ],
    objectSrc: ["'self'", ...trustedHosts],
    defaultSrc: ["'self'", ...trustedHosts],
    baseUri: ["'none'"],
  },
  reportOnly,
};

export const withCsp = (app: AppWrapperType): FC =>
  withSecureHeaders({
    contentSecurityPolicy,
    frameGuard: false,
    referrerPolicy: 'same-origin',
  })(app);
