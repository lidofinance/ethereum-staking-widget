interface Window {
  // see _document.js for definition
  _paq: undefined | [string, ...unknown[]][];
}

declare module 'next/config' {
  type ConfigTypes = () => {
    serverRuntimeConfig: {
      basePath: string | undefined;
      developmentMode: boolean;

      defaultChain: number;
      rpcUrls_1: [string, ...string[]];
      rpcUrls_5: [string, ...string[]];
      rpcUrls_17000: [string, ...string[]];
      ethplorerApiKey: string | undefined;

      cspTrustedHosts: string | undefined;
      cspReportUri: string | undefined;
      cspReportOnly: boolean;

      subgraphMainnet: string | undefined;
      subgraphGoerli: string | undefined;
      subgraphHolesky: string | undefined;
      subgraphRequestTimeout: number;

      rateLimit: number;
      rateLimitTimeFrame: number;

      ethAPIBasePath: string;
      rewardsBackendAPI: string;
    };
    publicRuntimeConfig: {
      basePath: string | undefined;
      developmentMode: boolean;
    };
  };

  declare const getConfig: ConfigTypes;

  export default getConfig;
}
