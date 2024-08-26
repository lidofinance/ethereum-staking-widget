import { collectDefaultMetrics, Registry } from 'prom-client';
import { METRICS_PREFIX } from 'consts/metrics';

import { collectStartupMetrics } from './startup-metrics';
import { RequestMetrics } from './request';

class Metrics {
  registry = new Registry();

  // compositions of metric types
  request = new RequestMetrics(this.registry);

  constructor() {
    this.collectStartupMetricsInit();
    collectDefaultMetrics({ prefix: METRICS_PREFIX, register: this.registry });
  }

  collectStartupMetricsInit() {
    collectStartupMetrics(this.registry);
  }
}

export default new Metrics();
