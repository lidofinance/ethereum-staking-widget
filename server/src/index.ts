// MUST be the first import: populates process.env from .env.local before
// any other module reads env at import time (config.ts Zod parse,
// env-dynamics.mjs consumed via config/networks).
import './load-env.js';

import Fastify from 'fastify';

import { config, rpcProviders } from './config.js';
import { loggerOptions } from './logger.js';
import { requestMetricsPlugin } from './plugins/request-metrics.js';
import { rateLimitPlugin } from './plugins/rate-limit.js';
import { securityHeadersPlugin } from './plugins/security-headers.js';

import { healthRoute } from './routes/health.js';
import { metricsRoute } from './routes/metrics.js';
import { cspReportRoute } from './routes/csp-report.js';
import { rewardsRoute } from './routes/rewards.js';
import { validationRoute } from './routes/validation.js';
import { validationFileRoute } from './routes/validation-file.js';
import { rpcRoute } from './routes/rpc.js';
import { earnVaultsAprRoute } from './routes/earn-vaults-apr.js';
import { earnVaultsTvlRoute } from './routes/earn-vaults-tvl.js';

const fastify = Fastify({
  logger: loggerOptions,
  trustProxy: true,
  // Slow-loris / partial-headers protection (same intent as the old
  // server.mjs headersTimeout/requestTimeout settings).
  bodyLimit: 1024 * 1024, // 1 MiB
  connectionTimeout: 60_000,
});

const start = async (): Promise<void> => {
  // Diagnostic: log which chains have RPC URLs configured (counts only,
  // no URL values — those are secrets).
  const rpcSummary = Object.fromEntries(
    Object.entries(rpcProviders).map(([id, urls]) => [id, urls.length]),
  );
  fastify.log.info({ rpcSummary }, 'startup: RPC providers per chain');

  // Plugins (order matters: metrics first so requests are tracked,
  // then security headers, then rate limit). NO global CORS: rewards /
  // validation / earn set `Access-Control-Allow-Origin: *` per-route,
  // `/api/rpc` is same-origin only — parity with the legacy wrappers.
  await fastify.register(requestMetricsPlugin);
  await fastify.register(securityHeadersPlugin);
  await fastify.register(rateLimitPlugin, {
    max: config.RATE_LIMIT,
    // RATE_LIMIT_TIME_FRAME is seconds by team convention; @fastify/rate-limit
    // wants ms.
    timeWindow: config.RATE_LIMIT_TIME_FRAME * 1000,
  });

  // Routes
  await fastify.register(healthRoute);
  await fastify.register(metricsRoute);
  await fastify.register(cspReportRoute);
  await fastify.register(rewardsRoute);
  await fastify.register(validationRoute);
  await fastify.register(validationFileRoute);
  await fastify.register(rpcRoute);
  await fastify.register(earnVaultsAprRoute);
  await fastify.register(earnVaultsTvlRoute);

  await fastify.listen({ host: config.HOST, port: config.PORT });
};

const gracefulShutdown = (signal: string): void => {
  fastify.log.info({ signal }, 'shutdown signal received');
  fastify
    .close()
    .then(() => process.exit(0))
    .catch((err) => {
      fastify.log.error({ err }, 'error during shutdown');
      process.exit(1);
    });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
