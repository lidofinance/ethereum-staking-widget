// The Content Security Policy, shared by the Next app (config/csp: the _app
// HOC and the IPFS <meta> tag) and the custom server (server.mjs, which sets
// the header on any HTML response the app let out without one). Plain ESM
// with no imports: server.mjs runs without the TS sources.

export const DEFAULT_COWSWAP_WIDGET_BASE_URL = 'https://cow-ipfs.testnet.fi/';

// light/dark theme on pageload apply script
// if script changes, new hash must be checked against CSP error and updated
const THEME_BOOTSTRAP_SCRIPT_HASH =
  "'sha256-wTvVT3oJ2rMAqNUILvSYccTn53N47S3NIZbPE0ql0No='";

const WALLETCONNECT_HOSTS = [
  'https://*.walletconnect.org',
  'https://*.walletconnect.com',
];

// reads an env flag the way config/helpers.ts toBoolean does
const toBoolean = (value) =>
  value?.toLowerCase?.() === 'true' ||
  value === true ||
  Number.parseInt(value, 10) === 1;

/**
 * The runtime inputs of the policy, from the server environment: the same
 * variables next.config.mjs hands the app through serverRuntimeConfig
 * @param {Record<string, string | undefined>} env
 */
export const cspInputsFromEnv = (env = process.env) => ({
  trustedHosts: env.CSP_TRUSTED_HOSTS ? env.CSP_TRUSTED_HOSTS.split(',') : [],
  // empty means "no reporting": next-secure-headers rejects '' as an invalid URL
  reportUri: env.CSP_REPORT_URI || undefined,
  reportOnly: toBoolean(env.CSP_REPORT_ONLY),
  cowswapBaseUrl:
    env.COWSWAP_WIDGET_BASE_URL || DEFAULT_COWSWAP_WIDGET_BASE_URL,
});

/**
 * @param {object} inputs
 * @param {string[]} inputs.trustedHosts - extra script sources (CSP_TRUSTED_HOSTS)
 * @param {string | undefined} inputs.reportUri - violation report endpoint (CSP_REPORT_URI)
 * @param {boolean} inputs.reportOnly - report-only delivery (CSP_REPORT_ONLY)
 * @param {string} inputs.cowswapBaseUrl - the CoW swap widget origin the DEX withdrawals frame
 * @param {boolean} inputs.developmentMode - allows HMR: 'unsafe-eval' and ws:
 * @param {boolean} inputs.ipfsMode - <meta> delivery, which ignores the header-only directives
 * @param {string} [inputs.ipfsBaseScriptHash] - hash of the IPFS bootstrap inline script
 */
export const createContentSecurityPolicy = ({
  trustedHosts,
  reportUri,
  reportOnly,
  cowswapBaseUrl,
  developmentMode,
  ipfsMode,
  ipfsBaseScriptHash,
}) => ({
  directives: {
    'default-src': ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    fontSrc: ["'self'", 'data:', 'https://fonts.reown.com'],
    imgSrc: ["'self'", 'data:', 'blob:', ...WALLETCONNECT_HOSTS],
    scriptSrc: [
      "'self'",
      THEME_BOOTSTRAP_SCRIPT_HASH,
      ...(developmentMode ? ["'unsafe-eval'"] : []), // for HMR
      ...(ipfsMode && ipfsBaseScriptHash ? [ipfsBaseScriptHash] : []),
      ...trustedHosts,
    ],

    // Allow fetch connections to any secure host
    connectSrc: [
      "'self'",
      'https:',
      'wss:',
      ...(developmentMode ? ['ws:'] : []), // for HMR
    ],
    // These directives are ignored when delivered via a <meta> element (IPFS mode).
    ...(!ipfsMode && {
      // Widget can be integrated into may wallets as iframe e.g Ledger Live, Safe Wallet
      frameAncestors: ['*'],
      // Modern way - References the group declared in the Reporting-Endpoints response header
      // Unavailable due to next.js and docker environment limitations
      // ...(reportUri && { reportTo: 'csp-endpoint' }),
      // Legacy way
      reportURI: reportUri,
    }),
    // frame-src takes precedence over child-src for iframes in modern browsers
    frameSrc: ["'self'", cowswapBaseUrl, ...WALLETCONNECT_HOSTS],
    // child-src kept as fallback for older browsers
    childSrc: ["'self'", ...WALLETCONNECT_HOSTS],
    workerSrc: ["'none'"],
    objectSrc: ["'none'"], // Block plugins (Flash etc.)
    mediaSrc: ["'none'"], // No audio/video sources needed
    manifestSrc: ["'self'"],
    formAction: ["'self'"], // Prevent form hijacking via XSS
    // Block inline event handlers (onclick="...", onerror="..." etc.)
    'script-src-attr': ["'none'"],
    'base-uri': ipfsMode ? undefined : ["'none'"],
  },
  reportOnly,
});
