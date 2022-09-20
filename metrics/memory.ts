import { Gauge, Registry } from 'prom-client';
import { METRICS_PREFIX } from 'config';
import cache from 'memory-cache';

export class MemoryMetrics {
  private memoryCacheMetrics: Gauge<'size' | 'memsize'>[];

  constructor(public registry: Registry) {
    this.memoryCacheMetrics = this.memoryCacheMetricsInit();
  }

  memoryCacheMetricsInit() {
    return (['size', 'memsize'] as const).map((metricName) => {
      const name = `${METRICS_PREFIX}memory_cache_${metricName}`;
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
