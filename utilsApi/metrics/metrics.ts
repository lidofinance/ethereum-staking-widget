import { collectDefaultMetrics, Registry } from 'prom-client';
import { collectStartupMetrics } from '@lidofinance/api-metrics';

import { dynamics } from 'config';
import { METRICS_PREFIX } from 'consts/metrics';
import buildInfoJson from 'build-info.json';

import { RequestMetrics } from './request';
import { SubgraphMetrics } from './subgraph';

class Metrics {
  registry = new Registry();

  // compositions of metric types
  subgraph = new SubgraphMetrics(this.registry);
  request = new RequestMetrics(this.registry);

  constructor() {
    this.collectStartupMetricsInit();
    collectDefaultMetrics({ prefix: METRICS_PREFIX, register: this.registry });
  }

  collectStartupMetricsInit() {
    collectStartupMetrics({
      prefix: METRICS_PREFIX,
      registry: this.registry,
      defaultChain: `${dynamics.defaultChain}`,
      supportedChains: dynamics.supportedChains.map((chain) => `${chain}`),
      version: buildInfoJson.version,
      commit: buildInfoJson.commit,
      branch: buildInfoJson.branch,
    });
  }
}

export default new Metrics();
