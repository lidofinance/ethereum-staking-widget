import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
  AggregatorRegistry,
} from 'prom-client';
import getConfig from 'next/config';
import { METRICS_PREFIX } from 'config';
import buildInfoJson from 'build-info.json';
import { collectStartupMetrics } from '@lidofinance/api-metrics';
import cache from 'memory-cache';

const { publicRuntimeConfig } = getConfig();
const { defaultChain, supportedChains } = publicRuntimeConfig;

class Metrics {
  constructor() {
    this.registry = new Registry();
    this.apiTimings = this.apiTimingsInit('internal');
    this.apiTimingsExternal = this.apiTimingsInit('external');
    this.requestCounter = this.requestsCounterInit();
    this.subgraphsResponseTime = this.subgraphsResponseTimeInit();
    this.memoryCacheMetrics = this.memoryCacheMetricsInit();

    AggregatorRegistry.setRegistries(this.registry);
    this.collectStartupMetricsInit();
    collectDefaultMetrics({ prefix: METRICS_PREFIX, register: this.registry });
  }

  apiTimings: Histogram<'route' | 'entity' | 'status'>;
  apiTimingsExternal: Histogram<'hostname' | 'route' | 'entity' | 'status'>;
  requestCounter: Counter<'route' | 'entity'>;
  subgraphsResponseTime: Histogram<'subgraphs'>;
  registry: Registry;
  private memoryCacheMetrics: Gauge<'size' | 'memsize'>[];

  apiTimingsInit(prefix: string) {
    const prefixWithDash = prefix ? `_${prefix}` : '';
    const apiResponseName = METRICS_PREFIX + 'api_response' + prefixWithDash;

    return new Histogram({
      name: apiResponseName,
      help: 'API_response_time',
      labelNames: ['hostname', 'route', 'entity', 'status'],
      buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
      registers: [this.registry],
    });
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

  subgraphsResponseTimeInit() {
    const subgraphsResponseTimeName = METRICS_PREFIX + 'subgraphs_response';

    return new Histogram({
      name: subgraphsResponseTimeName,
      help: 'Subgraphs response time seconds',
      buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
      registers: [this.registry],
    });
  }

  requestsCounterInit() {
    const requestsCounterName = METRICS_PREFIX + 'requests_total';

    return new Counter({
      name: requestsCounterName,
      help: 'Total number of requests for each valid route',
      labelNames: ['route', 'entity'],
      registers: [this.registry],
    });
  }

  memoryCacheMetricsInit() {
    return (['size', 'memsize'] as const).map((metricName) => {
      const name = `${METRICS_PREFIX + 'memory_cache'}_${metricName}`;
      const metric = new Gauge({
        name,
        help: 'Memory cache info',
        labelNames: [],
        registers: [this.registry],
        collect() {
          const value = cache[metricName]();
          this.set(value);
        },
      });
      return metric;
    });
  }
}

export default new Metrics();
