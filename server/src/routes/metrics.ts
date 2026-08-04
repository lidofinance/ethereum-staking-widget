import type { FastifyPluginAsync } from 'fastify';

import metrics from '../metrics/index.js';

/**
 * Prometheus scrape endpoint. In k8s this port is not exposed publicly —
 * only the in-cluster Prometheus ServiceMonitor scrapes it (wired by the
 * `staking-widget` Helm chart).
 */
export const metricsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/metrics', async (_req, reply) => {
    reply.header('content-type', metrics.registry.contentType);
    return metrics.registry.metrics();
  });
};
