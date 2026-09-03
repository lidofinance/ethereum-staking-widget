import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyRequest,
} from 'fastify';

export interface RateLimitOptions {
  max: number;
  timeWindow: number;
}

/**
 * Global IP-based rate limit using @fastify/rate-limit. Replaces
 * `@lidofinance/next-ip-rate-limit`.
 *
 * Client IP: `req.ip` with `trustProxy: true` on the Fastify instance.
 * The XFF-spoofing class of issues (bounty F1, fixed upstream in warehouse
 * PR #226 on 2026-07-15) does not reproduce here as long as the origin is
 * firewall-gated to Cloudflare — CF overwrites the forwarding headers at
 * the edge. If this API is ever exposed without CF in front, switch the
 * keyGenerator to a fixed trusted-proxy-depth parse.
 */
export const rateLimitPlugin: FastifyPluginAsync<RateLimitOptions> = fp(
  async (fastify: FastifyInstance, opts: RateLimitOptions) => {
    await fastify.register(rateLimit, {
      global: true,
      max: opts.max,
      timeWindow: opts.timeWindow,
      keyGenerator: (req: FastifyRequest) => req.ip,
      addHeadersOnExceeding: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
      },
      addHeaders: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
        'retry-after': true,
      },
    });
  },
);
