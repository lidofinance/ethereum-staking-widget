import { collectDefaultMetrics, Registry } from 'prom-client';
import { METRICS_PREFIX } from 'consts/metrics';

import { collectStartupMetrics } from './startup-metrics';
import { RequestMetrics } from './request';

import { getRPCCheckResults } from 'scripts/startup-checks/rpc.mjs';

class Metrics {
  registry = new Registry();

  // compositions of metric types
  request = new RequestMetrics(this.registry);

  constructor() {
    // TODO: temp
    const rpcCheckResults = getRPCCheckResults();
    console.debug('[Metrics] RPC Check Results:');
    console.debug(rpcCheckResults);

    collectStartupMetrics(this.registry);
    collectDefaultMetrics({ prefix: METRICS_PREFIX, register: this.registry });
  }
}

export default new Metrics();
