import NextBundleAnalyzer from '@next/bundle-analyzer';
import buildDynamics from './scripts/build-dynamics.mjs';
import generateBuildId from './scripts/generate-build-id.mjs';

buildDynamics();

const ipfsMode = process.env.IPFS_MODE == 'true';

// https://nextjs.org/docs/pages/api-reference/next-config-js/basePath
const basePath = process.env.BASE_PATH;

const rpcUrls_1 = process.env.EL_RPC_URLS_1?.split(',') ?? [];
const rpcUrls_5 = process.env.EL_RPC_URLS_5?.split(',') ?? [];
const rpcUrls_17000 = process.env.EL_RPC_URLS_17000?.split(',') ?? [];

const ethAPIBasePath = process.env.ETH_API_BASE_PATH;

const ethplorerApiKey = process.env.ETHPLORER_API_KEY;
const oneInchApiKey = process.env.ONE_INCH_API_KEY;

const cspTrustedHosts = process.env.CSP_TRUSTED_HOSTS;
const cspReportOnly = process.env.CSP_REPORT_ONLY;
const cspReportUri = process.env.CSP_REPORT_URI;

const subgraphMainnet = process.env.SUBGRAPH_MAINNET;
const subgraphGoerli = process.env.SUBGRAPH_GOERLI;
const subgraphHolesky = process.env.SUBGRAPH_HOLESKY;

const subgraphRequestTimeout = process.env.SUBGRAPH_REQUEST_TIMEOUT;

const analyzeBundle = process.env.ANALYZE_BUNDLE ?? false;

// rate limit
const rateLimit = process.env.RATE_LIMIT || 100;
const rateLimitTimeFrame = process.env.RATE_LIMIT_TIME_FRAME || 60; // 1 minute;

const rewardsBackendAPI = process.env.REWARDS_BACKEND;
const defaultChain = process.env.DEFAULT_CHAIN;

const developmentMode = process.env.NODE_ENV === 'development';

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
  generateBuildId,

  // IPFS next.js configuration reference:
  // https://github.com/Velenir/nextjs-ipfs-example
  trailingSlash: !!ipfsMode,
  assetPrefix: ipfsMode ? './' : undefined,

  // IPFS version has hash-based routing,
  // so we provide only index.html in ipfs version
  exportPathMap: ipfsMode ? () => ({ '/': { page: '/' } }) : undefined,

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
    config.module.rules.push(
      // Teach webpack to import svg and md files
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
      },
      {
        test: /\.md$/,
        use: 'raw-loader',
      },

      // Needs for `Conditional Compilation`,
      // because we have differences in source code of IPFS widget and NOT IPFS widget
      {
        test: /\.(t|j)sx?$/,
        use: [
          {
            loader: 'webpack-preprocessor-loader',
            options: {
              params: {
                IPFS_MODE: ipfsMode,
              },
            },
          },
        ],
      },
    );

    return config;
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'same-origin',
          },
          {
            key: 'x-content-type-options',
            value: 'nosniff',
          },
          { key: 'x-xss-protection', value: '1' },
          { key: 'x-download-options', value: 'noopen' },
        ],
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
    rpcUrls_17000,
    ethplorerApiKey,
    oneInchApiKey,
    cspTrustedHosts,
    cspReportOnly,
    cspReportUri,
    subgraphMainnet,
    subgraphGoerli,
    subgraphHolesky,
    subgraphRequestTimeout,
    rateLimit,
    rateLimitTimeFrame,
    ethAPIBasePath,
    rewardsBackendAPI,
    defaultChain,
    developmentMode,
  },
});
