import { Counter, Histogram, Registry } from 'prom-client';
import { METRICS_PREFIX } from 'config';

export class RequestMetrics {
  registry: Registry;
  apiTimings: Histogram<'hostname' | 'route' | 'entity' | 'status'>;
  apiTimingsExternal: Histogram<'hostname' | 'route' | 'entity' | 'status'>;
  requestCounter: Counter<'route' | 'entity'>;

  constructor(registry: Registry) {
    this.registry = registry;
    this.apiTimings = this.apiTimingsInit('internal');
    this.apiTimingsExternal = this.apiTimingsInit('external');
    this.requestCounter = this.requestsCounterInit();
  }

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

  requestsCounterInit() {
    const requestsCounterName = METRICS_PREFIX + 'requests_total';

    return new Counter({
      name: requestsCounterName,
      help: 'Total number of requests for each valid route',
      labelNames: ['route', 'entity'],
      registers: [this.registry],
    });
  }
}
