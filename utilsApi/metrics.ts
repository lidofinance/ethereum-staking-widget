import {
  Histogram,
  Registry,
  collectDefaultMetrics,
  Counter,
} from 'prom-client';
import getConfig from 'next/config';
import { METRICS_PREFIX } from 'config';
import buildInfoJson from 'build-info.json';
import {
  trackBuildInfo,
  trackChainConfig,
  rpcRequestCountFactory,
  rpcResponseTimeFactory,
} from '../backend-blocks';

const { publicRuntimeConfig } = getConfig();
const { defaultChain, supportedChains } = publicRuntimeConfig;

// BUILD & CHAIN INFO
const buildInfo = trackBuildInfo(METRICS_PREFIX, {
  version: process.env.npm_package_version ?? 'unversioned',
  commit: buildInfoJson.commit,
  branch: buildInfoJson.branch,
});
const chainConfig = trackChainConfig(METRICS_PREFIX, {
  defaultChain,
  supportedChains,
});

// RPC REQUEST COUNT
export const rpcRequestCount = rpcRequestCountFactory(METRICS_PREFIX);

// RPC RESPONSE TIME
export const INFURA = 'infura';
export const ALCHEMY = 'alchemy';

export const rpcResponseTime = rpcResponseTimeFactory(METRICS_PREFIX);

// RPC RESPONSE COUNT
export const rpcResponseCount = new Counter({
  name: METRICS_PREFIX + 'rpc_service_response_count',
  help: 'RPC service response count',
  labelNames: ['provider', 'chainId', 'status'],
  registers: [],
});

// SUBGRAPHS RESPONSE
export const subgraphsResponseTime = new Histogram({
  name: METRICS_PREFIX + 'subgraphs_response',
  help: 'Subgraphs response time seconds',
  buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
  registers: [],
});

// REGISTRY
export const registry = new Registry();

if (1 == 1 || process.env.NODE_ENV === 'production') {
  registry.registerMetric(buildInfo);
  registry.registerMetric(chainConfig);
  registry.registerMetric(rpcResponseTime);
  registry.registerMetric(rpcRequestCount);
  registry.registerMetric(rpcResponseCount);
  registry.registerMetric(subgraphsResponseTime);

  collectDefaultMetrics({ prefix: METRICS_PREFIX, register: registry });
}
