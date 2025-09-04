import { collectDefaultMetrics, Registry } from 'prom-client';
import { METRICS_PREFIX } from 'consts/metrics';
import { collectStartupMetrics } from './startup-metrics';
import { RequestMetrics } from './request';

const g = globalThis as any;

class Metrics {
  registry = new Registry();

  // compositions of metric types
  request = new RequestMetrics(this.registry);

  constructor() {
    void collectStartupMetrics(this.registry);
    collectDefaultMetrics({ prefix: METRICS_PREFIX, register: this.registry });
  }
}

// Ensure a single Metrics instance per Node.js thread/process (survives HMR/dev reloads).
// Note: this shares one instance across all imports within the SAME thread/process —
// this is especially important for Next.js ISR, where pages may be re-imported via a different code path.
const metrics: Metrics = g.__metricsSingleton ?? new Metrics();
if (!g.__metricsSingleton) g.__metricsSingleton = metrics;

export default metrics;
