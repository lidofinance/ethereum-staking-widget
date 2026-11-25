// Reference CSP and the CoW widget base URL resolver shared with the app
// (modules/dexes/cowswap). The served policy is rendered by
// infra/nginx/entrypoint.sh and scripts/vite/ipfs-head-defaults-plugin.ts:
// keep the directive set in sync. Plain ESM with no imports.

export const DEFAULT_COWSWAP_WIDGET_BASE_URL = 'https://cow-ipfs.testnet.fi/';

/**
 * The CoW widget base URL in one form for the frame-src source and the widget:
 * the widget library loads `<origin><path>/#/...`, so the path ends with one
 * '/' whether or not the configured value has it, and a source with a final
 * '/' admits that document by path prefix
 * @param {string | undefined} value - COWSWAP_WIDGET_BASE_URL
 */
export const resolveCowswapBaseUrl = (value) => {
  const baseUrl = value?.trim() || DEFAULT_COWSWAP_WIDGET_BASE_URL;
  try {
    const url = new URL(baseUrl);
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}/`;
  } catch {
    // not a URL: the widget library refuses it as well
    return baseUrl;
  }
};

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
 * variables infra/nginx/entrypoint.sh reads
 * @param {Record<string, string | undefined>} env
 */
export const cspInputsFromEnv = (env = process.env) => ({
  trustedHosts: env.CSP_TRUSTED_HOSTS ? env.CSP_TRUSTED_HOSTS.split(',') : [],
  // empty means "no reporting"
  reportUri: env.CSP_REPORT_URI || undefined,
  reportOnly: toBoolean(env.CSP_REPORT_ONLY),
  cowswapBaseUrl: resolveCowswapBaseUrl(env.COWSWAP_WIDGET_BASE_URL),
});

/**
 * @param {object} inputs
 * @param {string[]} inputs.trustedHosts - extra script sources (CSP_TRUSTED_HOSTS)
 * @param {string | undefined} inputs.reportUri - violation report endpoint (CSP_REPORT_URI)
 * @param {boolean} inputs.reportOnly - report-only delivery (CSP_REPORT_ONLY)
 * @param {string} inputs.cowswapBaseUrl - the CoW swap widget base URL the DEX frame loads, from resolveCowswapBaseUrl
 * @param {boolean} inputs.developmentMode - allows HMR: 'unsafe-eval' and ws:
 * @param {boolean} inputs.ipfsMode - <meta> delivery, which ignores the header-only directives
 * @param {string} [inputs.ipfsBaseScriptHash] - hash of the IPFS bootstrap inline script
 */
const buildContentSecurityPolicy = ({
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

// What Node's http.validateHeaderValue rejects (no node:http import: this
// module also runs in the browser bundle and the IPFS build)
const INVALID_HEADER_CHAR = /[^\t\u0020-\u007E\u0080-\u00FF]/;

const isAbsoluteUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const policyProblem = (policy) => {
  const { directives } = policy;
  const values = Object.values(directives).flat().filter(Boolean);
  if (values.some((value) => INVALID_HEADER_CHAR.test(String(value)))) {
    return 'a source has a character that is not allowed in a header value';
  }
  if (directives.reportURI && !isAbsoluteUrl(directives.reportURI)) {
    return 'the report URI is not an absolute URL';
  }
  return undefined;
};

// A source or URL that stays one token of one directive in the header
const isSafeToken = (value) =>
  typeof value === 'string' &&
  value !== '' &&
  !INVALID_HEADER_CHAR.test(value) &&
  !/[\s;,]/.test(value);

const isSafeUrl = (value) => isSafeToken(value) && isAbsoluteUrl(value);

/**
 * What is wrong with the env-derived inputs, one entry per invalid value
 * @param {Parameters<typeof buildContentSecurityPolicy>[0]} inputs
 * @returns {string[]}
 */
const inputProblems = ({ trustedHosts, reportUri, cowswapBaseUrl }) => [
  ...trustedHosts
    .filter((host) => !isSafeToken(host))
    .map((host) => `trusted host ${JSON.stringify(host)}`),
  ...(reportUri && !isSafeUrl(reportUri)
    ? [`report URI ${JSON.stringify(reportUri)}`]
    : []),
  ...(!isSafeUrl(cowswapBaseUrl)
    ? [`CoW base URL ${JSON.stringify(cowswapBaseUrl)}`]
    : []),
];

/**
 * The policy for the inputs. Fails closed: an invalid env-derived input
 * (a CSP_TRUSTED_HOSTS source, CSP_REPORT_URI, the CoW base URL) throws, so the
 * server does not start and the IPFS build does not complete with a policy
 * nobody configured.
 * @param {Parameters<typeof buildContentSecurityPolicy>[0]} inputs see above
 */
export const createContentSecurityPolicy = (inputs) => {
  // a blank entry is a separator artifact of CSP_TRUSTED_HOSTS ("a,,b", "a, b")
  const trustedHosts = inputs.trustedHosts
    .map((host) => (typeof host === 'string' ? host.trim() : host))
    .filter((host) => host !== '');
  const problems = inputProblems({ ...inputs, trustedHosts });
  if (problems.length > 0) {
    throw new Error(`[csp] invalid configuration: ${problems.join(', ')}`);
  }

  const policy = buildContentSecurityPolicy({ ...inputs, trustedHosts });
  const problem = policyProblem(policy);
  if (problem) throw new Error(`[csp] the policy is not valid: ${problem}`);
  return policy;
};
