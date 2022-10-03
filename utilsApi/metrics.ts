import {
  collectDefaultMetrics,
  Registry,
  AggregatorRegistry,
} from 'prom-client';
import getConfig from 'next/config';
import { METRICS_PREFIX } from 'config';
import buildInfoJson from 'build-info.json';
import { collectStartupMetrics } from '@lidofinance/api-metrics';
import { SubgraphMetrics, RequestMetrics, MemoryMetrics } from 'metrics';

const { publicRuntimeConfig } = getConfig();
const { defaultChain, supportedChains } = publicRuntimeConfig;

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
      defaultChain,
      supportedChains: supportedChains.split(','),
      version: buildInfoJson.version,
      commit: buildInfoJson.commit,
      branch: buildInfoJson.branch,
    });
  }
}

export default new Metrics();
