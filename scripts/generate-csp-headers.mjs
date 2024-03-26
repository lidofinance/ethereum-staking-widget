import { createSecureHeaders } from 'next-secure-headers';

const toBooleanEnv = (flag) =>
  typeof flag === 'boolean' ? flag : flag == 'true';

export const generatePolicy = ({
  cspTrustedHosts,
  cspReportUri,
  cspReportOnly,
  ipfsMode,
  developmentMode,
}) => {
  const reportOnly = toBooleanEnv(cspReportOnly);
  const isIpfsMode = toBooleanEnv(ipfsMode);
  const isDevelopmentMode = toBooleanEnv(developmentMode);
  const trustedHosts = cspTrustedHosts ? cspTrustedHosts.split(',') : [];
  return {
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
        ...(isDevelopmentMode ? ["'unsafe-eval'"] : []), // for HMR
        ...trustedHosts,
      ],

      // Allow fetch connections to any secure host
      connectSrc: [
        "'self'",
        'https:',
        'wss:',
        ...(isDevelopmentMode ? ['ws:'] : []), // for HMR
      ],

      ...(!isIpfsMode && {
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
      'base-uri': isIpfsMode ? undefined : ["'none'"],
    },
    reportOnly,
  };
};

export default ({
  cspTrustedHosts,
  cspReportOnly,
  cspReportUri,
  ipfsMode,
  developmentMode,
}) => {
  return createSecureHeaders({
    frameGuard: false,
    referrerPolicy: 'same-origin',
    contentSecurityPolicy: generatePolicy({
      cspTrustedHosts,
      cspReportUri,
      cspReportOnly,
      ipfsMode,
      developmentMode,
    }),
  });
};
