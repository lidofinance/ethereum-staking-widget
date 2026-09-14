import { trackedFetchRpcFactory } from '@lidofinance/api-rpc';

import { METRICS_PREFIX } from 'consts/metrics';
import Metrics from 'utilsApi/metrics';

// One instrumented fetch per process: the factory registers rpc_service_* in
// the prom-client registry, and a second registration under the same prefix
// throws. API routes are separate bundles, so globalThis is the shared slot —
// same pattern as the metrics registry itself.
const g = globalThis as any;

export const trackedFetchRpc =
  g.__trackedFetchRpcSingleton__ ??
  trackedFetchRpcFactory({
    registry: Metrics.registry,
    prefix: METRICS_PREFIX,
  });

if (!g.__trackedFetchRpcSingleton__) {
  g.__trackedFetchRpcSingleton__ = trackedFetchRpc;
}
