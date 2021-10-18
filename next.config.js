const basePath = process.env.BASE_PATH || '';
const infuraApiKey = process.env.INFURA_API_KEY;
const alchemyApiKey = process.env.ALCHEMY_API_KEY;

const defaultChain = process.env.DEFAULT_CHAIN;
const supportedChains = process.env.SUPPORTED_CHAINS;

const ethplorerApiKey = process.env.ETHPLORER_API_KEY;

const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cloudflareKvNamespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

module.exports = {
  basePath,
  future: {
    webpack5: true,
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
  },
  publicRuntimeConfig: {
    defaultChain,
    supportedChains,
  },
};
