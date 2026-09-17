import { trackedFetchRpcFactory } from '@lidofinance/api-rpc';
import type { TrackedFetchRPC } from '@lidofinance/api-rpc';

import { USER_AGENT } from 'config/groups/app';
import { METRICS_PREFIX } from 'consts/metrics';
import Metrics from 'utilsApi/metrics';

// One instrumented fetch per process: the factory registers rpc_service_* in
// the prom-client registry, and a second registration under the same prefix
// throws. API routes are separate bundles, so globalThis is the shared slot —
// same pattern as the metrics registry itself.
const g = globalThis as any;

const trackedFetch: TrackedFetchRPC =
  g.__trackedFetchRpcSingleton__ ??
  trackedFetchRpcFactory({
    registry: Metrics.registry,
    prefix: METRICS_PREFIX,
  });

if (!g.__trackedFetchRpcSingleton__) {
  g.__trackedFetchRpcSingleton__ = trackedFetch;
}

// fetchRpc only sets Content-Type, so without this providers see undici's
// default `node`. Normalised to a plain record because fetchRpc spreads it,
// and spreading a Headers instance yields nothing.
const withUserAgent = (headers: HeadersInit | undefined) => {
  const merged: Record<string, string> = {};
  new Headers(headers).forEach((value, key) => {
    merged[key] = value;
  });
  merged['User-Agent'] = USER_AGENT;
  return merged;
};

export const trackedFetchRpc: TrackedFetchRPC = (url, init, extension) =>
  trackedFetch(
    url,
    { ...init, headers: withUserAgent(init.headers) },
    extension,
  );
