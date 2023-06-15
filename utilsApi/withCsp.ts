import { withSecureHeaders } from 'next-secure-headers';
import getConfig from 'next/config';
import { FC } from 'react';
import { CustomApp } from 'types';

const { serverRuntimeConfig } = getConfig();
const { cspTrustedHosts, cspReportOnly, cspReportUri } = serverRuntimeConfig;

const trustedHosts = cspTrustedHosts ? cspTrustedHosts.split(',') : [];

const reportOnly = cspReportOnly === 'true';

export const contentSecurityPolicy = {
  directives: {
    styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', ...trustedHosts],
    imgSrc: ["'self'", 'data:', ...trustedHosts],
    scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", ...trustedHosts],
    connectSrc: [
      "'self'",
      'wss://*.walletconnect.org',
      'https://*.walletconnect.org',
      'https://*.coinbase.com',
      'wss://*.walletlink.org/',
      'https://api.1inch.exchange',
      'https://cdn.live.ledger.com/',
      'https://apiv5.paraswap.io/',
      'https://api.cow.fi/',
      'https://wq-api.testnet.fi',
      'https://wq-api.lido.fi',
      'https://wq-api.infra-staging.org',
      ...trustedHosts,
    ],
    formAction: ["'self'", ...trustedHosts],
    frameAncestors: ['*'],
    manifestSrc: ["'self'", ...trustedHosts],
    mediaSrc: ["'self'", ...trustedHosts],
    childSrc: ["'self'", ...trustedHosts],
    objectSrc: ["'self'", ...trustedHosts],
    defaultSrc: ["'self'", ...trustedHosts],
    baseUri: ["'none'"],
    reportURI: cspReportUri,
  },
  reportOnly,
};

export const withCsp = (app: CustomApp): FC =>
  withSecureHeaders({
    contentSecurityPolicy,
    frameGuard: false,
  })(app);
