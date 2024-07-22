import getConfigNext from 'next/config';
import { type Modify, toBoolean } from './helpers';

const { serverRuntimeConfig } = getConfigNext();

export type SecretConfigType = Modify<
  typeof serverRuntimeConfig,
  {
    defaultChain: number;

    rpcUrls_1: [string, ...string[]];
    rpcUrls_17000: [string, ...string[]];

    cspReportOnly: boolean;

    subgraphRequestTimeout: number;

    rateLimit: number;
    rateLimitTimeFrame: number;
  }
>;

// 'getSecretConfig()' is required for the backend side.
// We can't merge with 'getPreConfig()' because we want to split responsibility
//
// Also you can note that 'getSecretConfig' is just a proxy for 'serverRuntimeConfig'
// because we want similar approach with 'getConfig'
export const getSecretConfig = (): SecretConfigType => {
  return {
    ...serverRuntimeConfig,

    // Keep fallback as in 'env-dynamics.mjs'
    defaultChain: Number(serverRuntimeConfig.defaultChain) || 17000,

    // Hack: in the current implementation we can treat an empty array as a "tuple" (conditionally)
    rpcUrls_1: (serverRuntimeConfig.rpcUrls_1?.split(',') ?? []) as [
      string,
      ...string[],
    ],
    rpcUrls_17000: (serverRuntimeConfig.rpcUrls_17000?.split(',') ?? []) as [
      string,
      ...string[],
    ],

    cspReportOnly: toBoolean(serverRuntimeConfig.cspReportOnly),

    subgraphRequestTimeout:
      Number(serverRuntimeConfig.subgraphRequestTimeout) || 5000,

    rateLimit: Number(serverRuntimeConfig.rateLimit) || 100,
    rateLimitTimeFrame: Number(serverRuntimeConfig.rateLimitTimeFrame) || 60, // 1 minute;
  };
};

export const secretConfig = getSecretConfig();
