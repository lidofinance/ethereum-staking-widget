import { fetchRPCWithMetricsFactory } from '../backend-blocks';
import { registry } from './metrics';
import { METRICS_PREFIX } from '../config';
import { serverLogger } from './serverLogger';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();
const { infuraApiKey, alchemyApiKey } = serverRuntimeConfig;

export const fetchRPC = fetchRPCWithMetricsFactory({
  allowedRpcMethods: ['eth_call', 'eth_gasPrice'],
  metrics: {
    registry,
    prefix: METRICS_PREFIX,
  },
  logger: serverLogger,
  providers: {
    1: [
      `https://example.co`,
      `https://mainnet.infura.io/v3/1111`,
      `https://mainnet.infura.io/v3/${infuraApiKey}`,
      `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
    ],
    5: [
      `https://example.co`,
      `https://goerli.infura.io/v3/1111`,
      `https://goerli.infura.io/v3/${infuraApiKey}`,
      `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`,
    ],
  },
});
