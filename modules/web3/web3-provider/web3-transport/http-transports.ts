import { type Transport, http } from 'viem';

import { config } from 'config';

import { retryAfterTransport } from './retry-after-transport';

// The HTTP tiers of a chain's transport stack, in fallback order:
// our backend RPC (api/rpc), then the chain's default public RPC from
// wagmi.chains. Both batch JSON-RPC calls and honour Retry-After
export const createHttpTransports = (backendRpcUrl: string): Transport[] => {
  const batch = {
    wait: config.PROVIDER_BATCH_TIME,
    batchSize: config.PROVIDER_MAX_BATCH,
  };

  return [
    // our api/rpc (backend)
    retryAfterTransport(http(backendRpcUrl, { batch, name: backendRpcUrl })),
    // no url: viem takes it from the chain the transport is instantiated for
    retryAfterTransport(http(undefined, { batch, name: 'default public RPC' })),
  ];
};
