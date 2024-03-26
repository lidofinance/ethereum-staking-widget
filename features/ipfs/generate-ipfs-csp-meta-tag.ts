import { createHeadersObject } from 'next-secure-headers';
import getConfig from 'next/config';

import { generatePolicy } from 'scripts/generate-csp-headers.mjs';

const { serverRuntimeConfig } = getConfig();
const {
  cspTrustedHosts,
  cspReportOnly,
  cspReportUri,
  developmentMode,
  ipfsMode,
} = serverRuntimeConfig;

export const generateIpfsCSPMetaTag = () => {
  const secureHeaders = createHeadersObject({
    contentSecurityPolicy: generatePolicy({
      cspReportOnly,
      cspReportUri,
      cspTrustedHosts,
      developmentMode,
      ipfsMode,
    }),
  });
  return (
    secureHeaders['Content-Security-Policy'] ??
    secureHeaders['Content-Security-Policy-Report-Only']
  );
};
