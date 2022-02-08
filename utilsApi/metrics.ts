import { Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import getConfig from 'next/config';
import { METRICS_PREFIX } from 'config';
import buildInfoJson from 'build-info.json';

const { publicRuntimeConfig } = getConfig();
const { defaultChain, supportedChains } = publicRuntimeConfig;

// BUILD_INFO
const buildInfo = new Gauge({
  name: METRICS_PREFIX + 'build_info',
  help: 'Version, branch and commit of the current build',
  labelNames: ['version', 'commit', 'branch'],
  registers: [],
});

const version = process.env.npm_package_version ?? 'unversioned';

buildInfo.labels(version, buildInfoJson.commit, buildInfoJson.branch).set(1);
// /BUILD_INFO

// CHAIN CONFIG
const chainConfig = new Gauge({
  name: METRICS_PREFIX + 'chain_config_info',
  help: 'Default network and supported networks',
  labelNames: ['default_chain', 'supported_chains'],
  registers: [],
});

chainConfig.labels({ default_chain: defaultChain }).set(1);
if (typeof supportedChains === 'string') {
  supportedChains.split(',').forEach((chain) => {
    chainConfig.labels({ supported_chains: chain }).set(1);
  });
}
// /CHAIN CONFIG

// RPC RESPONSE
export const INFURA = 'infura';
export const ALCHEMY = 'alchemy';

export const rpcResponseTime = new Histogram({
  name: METRICS_PREFIX + 'rpc_service_response',
  help: 'RPC service response time seconds',
  buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
  labelNames: ['provider', 'chainId'],
  registers: [],
});
// /RPC RESPONSE

// SUBGRAPHS RESPONSE
export const subgraphsResponseTime = new Histogram({
  name: METRICS_PREFIX + 'subgraphs_response',
  help: 'Subgraphs response time seconds',
  buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
  registers: [],
});
// /SUBGRAPHS RESPONSE

export const registry = new Registry();

if (process.env.NODE_ENV === 'production') {
  registry.registerMetric(buildInfo);
  registry.registerMetric(chainConfig);
  registry.registerMetric(rpcResponseTime);
  registry.registerMetric(subgraphsResponseTime);

  collectDefaultMetrics({ prefix: METRICS_PREFIX, register: registry });
}
