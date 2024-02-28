interface Window {
  // see _document.js for definition
  _paq: undefined | [string, ...unknown[]][];
}

declare module 'next/config' {
  type ConfigTypes = () => {
    serverRuntimeConfig: {
      basePath: string;
      rpcUrls_1: [string, ...string[]];
      rpcUrls_5: [string, ...string[]];
      rpcUrls_17000: [string, ...string[]];
      ethplorerApiKey: string;
      cspTrustedHosts: string;
      cspReportOnly: string;
      cspReportUri: string;
      subgraphMainnet: string;
      subgraphGoerli: string;
      subgraphHolesky: string;
      subgraphRequestTimeout: number;
      rateLimit: number;
      rateLimitTimeFrame: number;
      ethAPIBasePath: string;
      rewardsBackendAPI: string;
      defaultChain: number;
      developmentMode: boolean;
    };
    publicRuntimeConfig: {
      basePath: string;
    };
  };

  declare const getConfig: ConfigTypes;

  export default getConfig;
}
