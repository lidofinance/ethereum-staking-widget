import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';

import metrics from '../metrics/index.js';

/**
 * Port of the `responseTimeMetric` middleware: observes
 * `eth_stake_widget_ui_api_response_internal{route,status}` for every
 * response, and counts `requests_total{route}`.
 *
 * Route label uses the ROUTE TEMPLATE without the leading slash (matches
 * the legacy `API_ROUTES` values like `api/rpc`) — never the raw URL,
 * which would explode label cardinality.
 */
export const requestMetricsPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.addHook('onRequest', async (req) => {
    (req as { _start?: bigint })._start = process.hrtime.bigint();
  });

  fastify.addHook('onResponse', async (req, reply) => {
    const template = req.routeOptions.url;
    if (!template || !template.startsWith('/api/')) return;
    const route = template.replace(/^\//, '');

    metrics.request.requestCounter.labels({ route, entity: '' }).inc();

    const start = (req as { _start?: bigint })._start;
    if (start == null) return;
    const seconds = Number(process.hrtime.bigint() - start) / 1e9;
    metrics.request.apiTimings
      .labels({
        hostname: '',
        route,
        entity: '',
        status: statusLabel(reply.statusCode),
      })
      .observe(seconds);
  });
});

/** Same bucketing as @lidofinance/api-metrics `getStatusLabel`. */
export const statusLabel = (status: number): string => {
  if (status >= 500) return '5xx';
  if (status >= 400) return '4xx';
  if (status >= 300) return '3xx';
  if (status >= 200) return '2xx';
  return '1xx';
};
