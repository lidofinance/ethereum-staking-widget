import { Gauge, Registry } from 'prom-client';
import { METRICS_PREFIX, METRIC_NAMES } from 'consts/metrics';

export class StartupChecksRPCMetrics {
  requestStatusGauge: Gauge<'rpc_domain' | 'chain_id'>;

  constructor(public registry: Registry) {
    this.requestStatusGauge = this.requestStatusGaugeInit();
  }

  requestStatusGaugeInit() {
    const requestsCounterName =
      METRICS_PREFIX + METRIC_NAMES.STARTUP_CHECKS_RPC_FAILED;

    return new Gauge({
      name: requestsCounterName,
      help: 'The total number of RPC checks after the app started.',
      labelNames: ['rpc_domain', 'chain_id'],
      registers: [this.registry],
    });
  }
}
