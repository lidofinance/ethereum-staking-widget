import { collectDefaultMetrics, Registry } from 'prom-client';
import { METRICS_PREFIX } from 'consts/metrics';

import { collectStartupMetrics } from './startup-metrics';
import { RequestMetrics } from './request';

class Metrics {
  registry = new Registry();

  // compositions of metric types
  request = new RequestMetrics(this.registry);

  constructor() {
    collectStartupMetrics(this.registry);
    collectDefaultMetrics({ prefix: METRICS_PREFIX, register: this.registry });
  }
}

export default new Metrics();
