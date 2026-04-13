import { FC } from 'react';
import { AppProps } from 'next/app';
import { withSecureHeaders } from 'next-secure-headers';
import type { ContentSecurityPolicyOption } from 'next-secure-headers/lib/rules';

// Don't use absolute import here!
// code'''
//    import { config, secretConfig } from 'config';
// '''
// otherwise you will get something like a cyclic error!
import { config } from '../get-config';
import { secretConfig } from '../get-secret-config';

const trustedHosts = secretConfig.cspTrustedHosts
  ? secretConfig.cspTrustedHosts.split(',')
  : [];

export const contentSecurityPolicy: ContentSecurityPolicyOption = {
  directives: {
    'default-src': ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    fontSrc: ["'self'", 'data:', 'https://fonts.reown.com'],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https://*.walletconnect.org',
      'https://*.walletconnect.com',
    ],
    scriptSrc: [
      "'self'",
      ...(config.developmentMode ? ["'unsafe-eval'"] : []), // for HMR
      ...trustedHosts,
    ],

    // Allow fetch connections to any secure host
    connectSrc: [
      "'self'",
      'https:',
      'wss:',
      ...(config.developmentMode ? ['ws:'] : []), // for HMR
    ],
    // These directives are ignored when delivered via a <meta> element (IPFS mode).
    ...(!config.ipfsMode && {
      frameAncestors: ['*'],
      // Modern way - References the group declared in the Reporting-Endpoints response header
      ...(secretConfig.cspReportUri && { reportTo: 'csp-endpoint' }),
      // Legacy way
      reportURI: secretConfig.cspReportUri,
    }),
    // frame-src takes precedence over child-src for iframes in modern browsers
    frameSrc: [
      "'self'",
      'https://swap.cow.fi', // CowSwap widget iframe
      'https://*.walletconnect.org',
      'https://*.walletconnect.com',
    ],
    // child-src kept as fallback for older browsers
    childSrc: [
      "'self'",
      'https://swap.cow.fi', // CowSwap widget iframe baseUrl
      'https://*.walletconnect.org',
      'https://*.walletconnect.com',
    ],
    workerSrc: ["'none'"],
    objectSrc: ["'none'"], // Block plugins (Flash etc.)
    mediaSrc: ["'none'"], // No audio/video sources needed
    manifestSrc: ["'self'"],
    formAction: ["'self'"], // Prevent form hijacking via XSS
    // Block inline event handlers (onclick="...", onerror="..." etc.)
    'script-src-attr': ["'none'"],
    'base-uri': config.ipfsMode ? undefined : ["'none'"],
  },
  reportOnly: secretConfig.cspReportOnly,
};

export const withCsp = (app: FC<AppProps>): FC =>
  withSecureHeaders({
    contentSecurityPolicy,
    frameGuard: false,
    referrerPolicy: 'same-origin',
  })(app);
