import { Gauge, Histogram, register } from 'prom-client';
import getConfig from 'next/config';
import { METRICS_PREFIX } from 'config';
import buildInfoJson from 'build-info.json';

const { publicRuntimeConfig } = getConfig();
const { defaultChain, supportedChains } = publicRuntimeConfig;

// Clear the register to avoid errors on Hot Reload
if (process.env.NODE_ENV === 'development') {
  register.clear();
}

// BUILD_INFO
const buildInfo = new Gauge({
  name: METRICS_PREFIX + 'build_info',
  help: 'Build information',
  labelNames: ['version', 'commit', 'branch'],
});

export const collectBuildInfo = (): void => {
  const { version, commit, branch } = buildInfoJson;

  buildInfo.labels(version, commit, branch).set(1);
};
// /BUILD_INFO

// CHAIN CONFIG
const chainConfig = new Gauge({
  name: METRICS_PREFIX + 'chain_config_info',
  help: 'Default network and supported networks',
  labelNames: ['default_chain', 'supported_chains'],
});

export const collectChainConfig = (): void => {
  chainConfig.labels(defaultChain, supportedChains).set(1);
};
// /CHAIN CONFIG

// RPC RESPONSE
export const INFURA = 'infura';
export const ALCHEMY = 'alchemy';

export const rpcResponseTime = new Histogram({
  name: METRICS_PREFIX + 'rpc_service_response',
  help: 'RPC service response time seconds',
  buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
  labelNames: ['provider'],
});
// /RPC RESPONSE

// SUBGRAPHS RESPONSE
export const subgraphsResponseTime = new Histogram({
  name: METRICS_PREFIX + 'subgraphs_response',
  help: 'Subgraphs response time seconds',
  buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
});
// /SUBGRAPHS RESPONSE
