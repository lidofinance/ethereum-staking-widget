export default (cspTrustedHosts, cspReportUri, cspReportOnly) => {
  const trustedHosts = cspTrustedHosts ? cspTrustedHosts.split(',') : [];
  const reportOnly = cspReportOnly === 'true';
  return {
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
      scriptSrc: [
        "'self'",
        "'unsafe-eval'",
        "'unsafe-inline'",
        ...trustedHosts,
      ],
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
      formAction: ["'self'", ...trustedHosts],
      frameAncestors: ['*'],
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
      reportURI: cspReportUri,
    },
    reportOnly,
  };
};
