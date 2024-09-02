import { Counter, Registry } from 'prom-client';
import { METRICS_PREFIX, METRIC_NAMES } from 'consts/metrics';

export class StartupChecksRPCMetrics {
  requestCounter: Counter<'rpc_domain' | 'success'>;

  constructor(public registry: Registry) {
    this.requestCounter = this.requestsCounterInit();
  }

  requestsCounterInit() {
    const requestsCounterName =
      METRICS_PREFIX + METRIC_NAMES.STARTUP_CHECKS_RPC;

    return new Counter({
      name: requestsCounterName,
      help: 'The total number of RPC checks after the app started.',
      labelNames: ['rpc_domain', 'success'],
      registers: [this.registry],
    });
  }
}
