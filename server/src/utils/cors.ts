import type { FastifyReply } from 'fastify';

/**
 * Per-route CORS, parity with the legacy `cors({ origin: ['*'] })` wrapper:
 * applied ONLY on rewards / validation / earn routes. `/api/rpc` never had
 * CORS (same-origin only) and must stay that way — the previous PoC port
 * drifted by registering @fastify/cors globally.
 */
export const allowAnyOrigin = (reply: FastifyReply): void => {
  reply.header('access-control-allow-origin', '*');
};
