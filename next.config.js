const basePath = process.env.BASE_PATH;
const infuraApiKey = process.env.INFURA_API_KEY;
const alchemyApiKey = process.env.ALCHEMY_API_KEY;
const aprAPIBasePath = process.env.APR_API_BASE_PATH;

const defaultChain = process.env.DEFAULT_CHAIN;
const supportedChains = process.env.SUPPORTED_CHAINS;

const ethplorerApiKey = process.env.ETHPLORER_API_KEY;

const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cloudflareKvNamespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

const cspTrustedHosts = process.env.CSP_TRUSTED_HOSTS;
const cspReportOnly = process.env.CSP_REPORT_ONLY;
const cspReportUri = process.env.CSP_REPORT_URI;

const subgraphMainnet = process.env.SUBGRAPH_MAINNET;
const subgraphRopsten = process.env.SUBGRAPH_ROPSTEN;
const subgraphRinkeby = process.env.SUBGRAPH_RINKEBY;
const subgraphGoerli = process.env.SUBGRAPH_GOERLI;
const subgraphKovan = process.env.SUBGRAPH_KOVAN;
const subgraphKintsugi = process.env.SUBGRAPH_KINTSUGI;

const subgraphRequestTimeout = process.env.SUBGRAPH_REQUEST_TIMEOUT;

const enableQaHelpers = process.env.ENABLE_QA_HELPERS;

const metricsPort = process.env.METRICS_PORT ?? 3001;
const matomoUrl = process.env.MATOMO_URL;

// rate limit
const rateLimit = process.env.RATE_LIMIT;
const rateLimitTimeFrame = process.env.RATE_LIMIT_TIME_FRAME;

// Need to initialize AggregatorRegistry for each worker, because we need to setup listeners
// https://github.com/siimon/prom-client/blob/721829cc593bb7da28ae009985caeeacb4b59e05/lib/cluster.js#L153
// Otherwise requests for metrics will crash all forks at once
const { AggregatorRegistry } = require('prom-client');
new AggregatorRegistry();

module.exports = {
  basePath,
  compiler: {
    styledComponents: true,
  },
  webpack(config) {
    // Teach webpack to import svg files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack', 'url-loader'],
    });

    // Teach webpack to import md files
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });

    return config;
  },
  async headers() {
    return [
      {
        // required for gnosis save apps
        source: '/manifest.json',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
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
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  serverRuntimeConfig: {
    basePath,
    infuraApiKey,
    alchemyApiKey,
    ethplorerApiKey,
    cloudflareApiToken,
    cloudflareAccountId,
    cloudflareKvNamespaceId,
    cspTrustedHosts,
    cspReportOnly,
    cspReportUri,
    subgraphMainnet,
    subgraphRopsten,
    subgraphRinkeby,
    subgraphGoerli,
    subgraphKovan,
    subgraphKintsugi,
    subgraphRequestTimeout,
    metricsPort,
    rateLimit,
    rateLimitTimeFrame,
    aprAPIBasePath,
  },
  publicRuntimeConfig: {
    defaultChain,
    supportedChains,
    enableQaHelpers,
    matomoUrl,
  },
};
