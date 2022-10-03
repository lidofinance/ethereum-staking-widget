import { Gauge, Registry } from 'prom-client';
import { METRICS_PREFIX, MEMORY_CACHE_METRICS, METRIC_NAMES } from 'config';
import cache from 'memory-cache';

export class MemoryMetrics {
  constructor(public registry: Registry) {
    this.memoryCacheMetricsInit();
  }

  memoryCacheMetricsInit() {
    MEMORY_CACHE_METRICS.map((metricName) => {
      const name = `${METRICS_PREFIX}${METRIC_NAMES.MEMORY_CACHE}_${metricName}`;
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
