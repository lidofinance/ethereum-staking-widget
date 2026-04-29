import rateLimit from '@fastify/rate-limit';
import fastify from 'fastify';

import Metrics from './handlers/metrics.js';
import { registerCspReportRoute } from './handlers/csp-report.js';
import { registerVaultAPRRoute } from './handlers/earn-vaults-apr.js';
import { registerVaultTvlRoutes } from './handlers/earn-vaults-tvl.js';
import { registerRpcRoute } from './handlers/rpc-config.js';
import { registerValidationRoute } from './handlers/validation.js';

const app = fastify({ logger: true });
const pushgatewayUrl = process.env.PUSHGATEWAY;

const rateLimitMax = Number(process.env.RATE_LIMIT) || 60;
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_TIME_FRAME) || 60;

void app.register(rateLimit, {
  max: rateLimitMax,
  timeWindow: rateLimitWindowMs * 1000,
});

app.addContentTypeParser(
  ['application/csp-report', 'application/reports+json'],
  { parseAs: 'string' },
  (_request, body, done) => {
    done(null, body);
  },
);

const DEFAULT_API_ERROR_MESSAGE = 'Something went wrong.';

const extractErrorMessage = (
  error: unknown,
  defaultMessage?: string,
): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return defaultMessage ?? DEFAULT_API_ERROR_MESSAGE;
};

const isErrorWithStatus = (error: unknown): error is { status: number } => {
  if (typeof error !== 'object' || error === null) return false;
  return 'status' in error;
};

app.setErrorHandler(async (error, _request, reply) => {
  if (reply.raw.headersSent) {
    reply.log.error(
      '[fastifyDefaultErrorHandler] error after headers sent:' +
        extractErrorMessage(error),
    );
    return;
  }

  const isInnerError = reply.statusCode === 200;
  const status = isInnerError ? 500 : reply.statusCode || 500;

  if (isErrorWithStatus(error)) {
    reply.log.error(extractErrorMessage(error));
    await reply
      .status(error.status)
      .send({ message: extractErrorMessage(error) });
    return;
  }

  if (error instanceof Error) {
    reply.log.error(extractErrorMessage(error));
    await reply.status(status).send({ message: extractErrorMessage(error) });
    return;
  }

  await reply.status(status).send({ message: DEFAULT_API_ERROR_MESSAGE });
});

const getStatusLabel = (status?: number) => {
  if (status == null || status < 100 || status > 600) return 'xxx';
  const majorStatus = Math.trunc(status / 100);
  return `${majorStatus}xx`;
};

app.addHook('onRequest', async (request) => {
  (request as typeof request & { _startAt?: number })._startAt = Date.now();
});

app.addHook('onResponse', async (request, reply) => {
  const startAt = (request as typeof request & { _startAt?: number })._startAt;
  if (!startAt) return;

  const route = request.routeOptions?.url || request.raw.url || 'unknown';

  const status = getStatusLabel(reply.statusCode);

  Metrics.request.apiTimings
    .labels({
      hostname: 'fastify',
      route,
      entity: 'api',
      status,
    })
    .observe((Date.now() - startAt) / 1000);
});

app.get('/health', async () => ({ status: 'ok' }));

app.get('/api/metrics', async (_request, reply) => {
  const metrics = await Metrics.registry.metrics();
  await reply
    .header('Content-Type', Metrics.registry.contentType)
    .send(metrics);
});

registerVaultAPRRoute(app);
registerVaultTvlRoutes(app);
registerValidationRoute(app);
registerCspReportRoute(app);
registerRpcRoute(app);

const port = Number(process.env.API_PORT);
const host = process.env.API_HOST;

void app.listen({ port, host });

const pushMetricsToPushgateway = async () => {
  if (!pushgatewayUrl) return;

  try {
    const metricsData = await Metrics.registry.metrics();
    const response = await fetch(`${pushgatewayUrl}/metrics/job/api`, {
      method: 'POST',
      body: metricsData,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to push metrics, status: ${response.status}`);
    }
  } catch (error) {
    app.log.error({ error }, '[pushgateway] Failed to push metrics');
  }
};

const gracefulShutdown = () => {
  void (async () => {
    await pushMetricsToPushgateway();
    await app.close();
    process.exit(0);
  })().catch((error) => {
    app.log.error({ error }, '[shutdown] Failed graceful shutdown');
    process.exit(1);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
