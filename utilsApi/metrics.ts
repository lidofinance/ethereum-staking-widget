import { Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import getConfig from 'next/config';
import { METRICS_PREFIX } from 'config';
import buildInfoJson from 'build-info.json';
import { collectStartupMetrics } from '@lidofinance/api-metrics';

const { publicRuntimeConfig } = getConfig();
const { defaultChain, supportedChains } = publicRuntimeConfig;

export const subgraphsResponseTime = new Histogram({
  name: METRICS_PREFIX + 'subgraphs_response',
  help: 'Subgraphs response time seconds',
  buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
  registers: [],
});

export const registry = new Registry();

collectStartupMetrics({
  prefix: METRICS_PREFIX,
  registry,
  defaultChain,
  supportedChains: supportedChains.split(','),
  version: process.env.npm_package_version ?? 'unversioned',
  commit: buildInfoJson.commit,
  branch: buildInfoJson.branch,
});

// TODO: remove 1==1, need for debug
if (1 == 1 || process.env.NODE_ENV === 'production') {
  registry.registerMetric(subgraphsResponseTime);

  collectDefaultMetrics({ prefix: METRICS_PREFIX, register: registry });
}
