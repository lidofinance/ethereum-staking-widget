import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';

/**
 * Security headers the Next.js `next.config.mjs` `headers()` used to emit
 * on `/api/*` responses. Values verbatim from that config (HSTS one year —
 * the PoC port drifted to 30 days). HTML/UI-only concerns (CSP,
 * Permissions-Policy, COOP) live with the web pod's nginx config — the API
 * never serves HTML.
 */
export const securityHeadersPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.addHook('onSend', async (_req, reply, payload) => {
    reply.header(
      'strict-transport-security',
      'max-age=31536000; includeSubDomains; preload',
    );
    reply.header('referrer-policy', 'same-origin');
    reply.header('x-content-type-options', 'nosniff');
    reply.header('x-dns-prefetch-control', 'on');
    reply.header('x-download-options', 'noopen');
    reply.header('x-permitted-cross-domain-policies', 'none');
    reply.header('x-xss-protection', '1; mode=block');
    return payload;
  });
});
