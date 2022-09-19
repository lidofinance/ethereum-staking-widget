import {
  collectDefaultMetrics,
  Registry,
  AggregatorRegistry,
} from 'prom-client';
import { METRICS_PREFIX, dynamics } from 'config';
import buildInfoJson from 'build-info.json';
import { collectStartupMetrics } from '@lidofinance/api-metrics';
import { SubgraphMetrics, RequestMetrics, MemoryMetrics } from 'metrics';

class Metrics {
  registry = new Registry();

  // compositions of metric types
  subgraph = new SubgraphMetrics(this.registry);
  request = new RequestMetrics(this.registry);
  memory = new MemoryMetrics(this.registry);

  constructor() {
    AggregatorRegistry.setRegistries(this.registry);
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
