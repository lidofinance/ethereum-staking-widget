import { fetchRPCWithMetricsFactory } from '../backend-blocks';
import { registry } from './metrics';
import { METRICS_PREFIX } from '../config';
import { serverLogger } from './serverLogger';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();
const { infuraApiKey, alchemyApiKey } = serverRuntimeConfig;

export const fetchRPC = fetchRPCWithMetricsFactory({
  metrics: {
    registry,
    prefix: METRICS_PREFIX,
  },
  serverLogger: serverLogger,
  providers: {
    1: [
      // Will produce network error
      `https://example.co`,
      // Will produce RPC error
      `https://mainnet.infura.io/v3/1111`,
      `https://mainnet.infura.io/v3/${infuraApiKey}`,
      `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
    ],
    5: [
      // Will produce network error
      `https://example.co`,
      // Will produce RPC error
      `https://goerli.infura.io/v3/1111`,
      `https://goerli.infura.io/v3/${infuraApiKey}`,
      `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`,
    ],
  },
});
