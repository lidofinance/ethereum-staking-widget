import type { FastifyInstance, HTTPMethods } from 'fastify';

const ALL_METHODS: HTTPMethods[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
];

/**
 * Registers 405 handlers for every method NOT in `allowed` on `url`.
 * Parity with `@lidofinance/next-api-wrapper`'s `httpMethodGuard`, which
 * answered wrong-method requests with `405 Method Not Allowed` + `Allow`
 * header (bare Fastify would answer 404 — a behavioral drift for clients
 * that branch on 405).
 *
 * HEAD is implied by GET (Fastify exposeHeadRoutes) and never blocked here.
 */
export const methodNotAllowed = (
  fastify: FastifyInstance,
  url: string,
  allowed: HTTPMethods[],
): void => {
  const blocked = ALL_METHODS.filter((m) => !allowed.includes(m));
  if (blocked.length === 0) return;
  fastify.route({
    method: blocked,
    url,
    handler: async (_req, reply) => {
      reply
        .header('allow', allowed.join(', '))
        .code(405)
        .send({ error: 'Method Not Allowed' });
    },
  });
};
