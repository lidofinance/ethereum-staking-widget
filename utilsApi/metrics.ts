import { Histogram, register, collectDefaultMetrics } from 'prom-client';
import { METRICS_PREFIX, dynamics } from 'config';
import buildInfoJson from 'build-info.json';
import { collectStartupMetrics } from '@lidofinance/api-metrics';

export const subgraphsResponseTime = new Histogram({
  name: METRICS_PREFIX + 'subgraphs_response',
  help: 'Subgraphs response time seconds',
  buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
  registers: [],
});

export const registry = register;

collectStartupMetrics({
  prefix: METRICS_PREFIX,
  registry,
  defaultChain: `${dynamics.defaultChain}`,
  supportedChains: dynamics.supportedChains.map((chain) => `${chain}`),
  version: process.env.npm_package_version ?? 'unversioned',
  commit: buildInfoJson.commit,
  branch: buildInfoJson.branch,
});

registry.registerMetric(subgraphsResponseTime);
collectDefaultMetrics({ prefix: METRICS_PREFIX, register: registry });
