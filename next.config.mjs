import NextBundleAnalyzer from '@next/bundle-analyzer';
import createSecureHeaders from 'next-secure-headers';
import buildDynamics from './scripts/build-dynamics.mjs';
import configCSP from './scripts/config-csp.mjs';

buildDynamics();

const basePath = process.env.BASE_PATH;
// TODO: deprecate old envs
const infuraKey = process.env.INFURA_API_KEY;
const alchemyKey = process.env.ALCHEMY_API_KEY;

const rpcUrls_1 = [
  ...(process.env.EL_RPC_URLS_1?.split(',') ?? []),
  alchemyKey && `https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`,
  infuraKey && `https://mainnet.infura.io/v3/${infuraKey}`,
].filter(Boolean);

const rpcUrls_5 = [
  ...(process.env.EL_RPC_URLS_5?.split(',') ?? []),
  alchemyKey && `https://eth-goerli.alchemyapi.io/v2/${alchemyKey}`,
  infuraKey && `https://goerli.infura.io/v3/${infuraKey}`,
].filter(Boolean);

const ethAPIBasePath = process.env.ETH_API_BASE_PATH;

const ethplorerApiKey = process.env.ETHPLORER_API_KEY;

// TODO: Delete this ENV
const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cloudflareKvNamespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

const subgraphMainnet = process.env.SUBGRAPH_MAINNET;
const subgraphGoerli = process.env.SUBGRAPH_GOERLI;

const subgraphRequestTimeout = process.env.SUBGRAPH_REQUEST_TIMEOUT;

const analyzeBundle = process.env.ANALYZE_BUNDLE ?? false;

// rate limit
const rateLimit = process.env.RATE_LIMIT || 100;
const rateLimitTimeFrame = process.env.RATE_LIMIT_TIME_FRAME || 60; // 1 minute;

const rewardsBackendAPI = process.env.REWARDS_BACKEND;
const defaultChain = process.env.DEFAULT_CHAIN;

// cache control
export const CACHE_CONTROL_HEADER = 'x-cache-control';
export const CACHE_CONTROL_PAGES = [
  '/manifest.json',
  '/favicon:size*',
  '/',
  '/wrap',
  '/wrap/unwrap',
  '/rewards',
  '/referral',
  '/withdrawals/request',
  '/withdrawals/claim',
  '/runtime/window-env.js',
];
export const CACHE_CONTROL_VALUE =
  'public, max-age=15, s-max-age=30, stale-if-error=604800, stale-while-revalidate=172800';

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: analyzeBundle,
});

export default withBundleAnalyzer({
  basePath,
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    styledComponents: true,
  },
  experimental: {
    // Fixes a build error with importing Pure ESM modules, e.g. reef-knot
    // Some docs are here:
    // https://github.com/vercel/next.js/pull/27069
    // You can see how it is actually used in v12.3.4 here:
    // https://github.com/vercel/next.js/blob/v12.3.4/packages/next/build/webpack-config.ts#L417
    // Presumably, it is true by default in next v13 and won't be needed
    esmExternals: true,
  },
  webpack(config) {
    // Teach webpack to import svg and md files
    config.module.rules.push(
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
      },
      {
        test: /\.md$/,
        use: 'raw-loader',
      },
    );

    return config;
  },
  async headers() {
    const cspTrustedHosts = process.env.CSP_TRUSTED_HOSTS;
    const cspReportOnly = process.env.CSP_REPORT_ONLY;
    const cspReportUri = process.env.CSP_REPORT_URI;
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/(.*)',
        headers: createSecureHeaders({
          contentSecurityPolicy: configCSP(
            cspTrustedHosts,
            cspReportUri,
            cspReportOnly,
          ),
          frameGuard: false,
          referrerPolicy: 'same-origin',
        }),
      },
      {
        // required for gnosis save apps
        source: '/manifest.json',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
      ...CACHE_CONTROL_PAGES.map((page) => ({
        source: page,
        headers: [{ key: CACHE_CONTROL_HEADER, value: CACHE_CONTROL_VALUE }],
      })),
    ];
  },
  redirects: () => [
    {
      source: '/withdrawals',
      destination: '/withdrawals/request',
      permanent: false,
    },
  ],
  serverRuntimeConfig: {
    basePath,
    rpcUrls_1,
    rpcUrls_5,
    ethplorerApiKey,
    cloudflareApiToken,
    cloudflareAccountId,
    cloudflareKvNamespaceId,
    subgraphMainnet,
    subgraphGoerli,
    subgraphRequestTimeout,
    rateLimit,
    rateLimitTimeFrame,
    ethAPIBasePath,
    rewardsBackendAPI,
    defaultChain,
  },
});
