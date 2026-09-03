// MUST be the first import: populates process.env from .env.local before
// any other module reads env at import time (config.ts Zod parse,
// config/client-env-manifest.ts consumed via config/networks).
import './load-env.js';

import Fastify from 'fastify';

import { startupCheckManifestFile } from '../../scripts/startup-checks/config-manifest.mjs';
import { startupCheckValidationFile } from '../../scripts/startup-checks/validation-file.mjs';
import { getRPCChecks } from '../../scripts/startup-checks/rpc.mjs';
import {
  registerSecretsRotationRestart,
  registerShutdownSignals,
} from '../../scripts/shutdown.mjs';

import { config, rpcProvidersUrls } from './config.js';
import { loggerOptions } from './logger.js';
import { maskedError } from './utils/masked-error.js';
import { requestMetricsPlugin } from './plugins/request-metrics.js';
import { rateLimitPlugin } from './plugins/rate-limit.js';
import { securityHeadersPlugin } from './plugins/security-headers.js';

import { healthRoute } from './routes/health.js';
import { metricsRoute } from './routes/metrics.js';
import { cspReportRoute } from './routes/csp-report.js';
import { rewardsRoute } from './routes/rewards.js';
import { validationRoute } from './routes/validation.js';
import { rpcRoute } from './routes/rpc.js';
import { earnVaultsAprRoute } from './routes/earn-vaults-apr.js';
import { earnVaultsTvlRoute } from './routes/earn-vaults-tvl.js';
import { geoRoute } from './routes/geo.js';
import { configManifestRoute } from './routes/config-manifest.js';

const fastify = Fastify({
  logger: loggerOptions,
  trustProxy: true,
  // partial-headers protection (same intent as the old
  // server.mjs headersTimeout/requestTimeout settings).
  bodyLimit: 1024 * 1024, // 1 MiB
  connectionTimeout: 60_000,
});

const start = async (): Promise<void> => {
  // Diagnostic: log which chains have RPC URLs configured (counts only,
  // no URL values — those are secrets).
  const rpcSummary = Object.fromEntries(
    Object.entries(rpcProvidersUrls).map(([id, urls]) => [id, urls.length]),
  );
  fastify.log.info({ rpcSummary }, 'startup: RPC providers per chain');

  // Fail fast on a broken manifest/validation file — both checks process.exit
  // on invalid content and skip when their env path is unset. Awaited before
  // listen so a broken config never passes readiness. RPC checks are kicked
  // off by the metrics collector; await whatever it has already started.
  if (process.env.RUN_STARTUP_CHECKS === 'true') {
    await Promise.all([
      startupCheckManifestFile(),
      startupCheckValidationFile(),
      getRPCChecks(),
    ]);
  }

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
  await fastify.register(rpcRoute);
  await fastify.register(earnVaultsAprRoute);
  await fastify.register(earnVaultsTvlRoute);
  await fastify.register(geoRoute);
  await fastify.register(configManifestRoute);

  await fastify.listen({ host: config.HOST, port: config.PORT });

  // Shared with the Next target: graceful close on signals (force-exit timer
  // guards a hung close) and restart-by-exit on OpenBao secret rotation.
  // Fastify's close callback takes no error argument — the helper's error
  // branch stays dormant, the exit path is unchanged.
  registerShutdownSignals(fastify);
  registerSecretsRotationRestart(fastify);
};

start().catch((err) => {
  console.error('Fatal startup error:', maskedError(err));
  process.exit(1);
});
