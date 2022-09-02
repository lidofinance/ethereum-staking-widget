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
  version: buildInfoJson.version,
  commit: buildInfoJson.commit,
  branch: buildInfoJson.branch,
});

registry.registerMetric(subgraphsResponseTime);
collectDefaultMetrics({ prefix: METRICS_PREFIX, register: registry });
