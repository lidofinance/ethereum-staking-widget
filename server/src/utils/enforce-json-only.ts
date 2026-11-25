import fp from 'fastify-plugin';
import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyRequest,
} from 'fastify';

export const JSON_CONTENT_TYPE = 'application/json';

// A document the browser would render under the widget origin if an API
// response carried this type: what a top-level navigation asks for
const DOCUMENT_MEDIA_TYPES = [
  'text/html',
  'application/xhtml+xml',
  'application/xml',
  'text/xml',
  'image/svg+xml',
];

const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD', 'OPTIONS']);

const mediaTypeOf = (header: string | string[] | undefined): string => {
  const value = Array.isArray(header) ? header[0] : header;
  return value?.split(';')[0]?.trim().toLowerCase() ?? '';
};

const mediaTypesOf = (header: string | string[] | undefined): string[] => {
  const value = Array.isArray(header) ? header.join(',') : header;
  return (value ?? '')
    .split(',')
    .map((entry) => entry.split(';')[0]?.trim().toLowerCase() ?? '')
    .filter(Boolean);
};

export interface EnforceJsonOnlyOptions {
  paths: readonly string[];
}

/**
 * Keeps a proxy route JSON in both directions, so no reply of an upstream
 * can run as a document under the widget origin. Port of develop's
 * `utilsApi/enforce-json-only.ts` wrapper.
 *
 * Request: the body must be JSON (an HTML form can only send urlencoded,
 * multipart or text/plain, so this alone stops a form navigation), and
 * `Accept` must not ask for a document type. An absent `Accept` and the
 * wildcard pass, which is what fetch clients send.
 *
 * Response: `Content-Type` is pinned to JSON whatever the handler or its
 * upstream sets, and a sandbox CSP gives any reply that is still rendered as
 * a document an opaque origin.
 *
 * Register before the rate limiter: global `onRequest` hooks run in
 * registration order, so the guard is outermost and its pin covers 404, 429
 * and body-parser errors too.
 */
export const enforceJsonOnly: FastifyPluginAsync<EnforceJsonOnlyOptions> = fp(
  async (fastify: FastifyInstance, opts: EnforceJsonOnlyOptions) => {
    const paths = new Set(opts.paths);
    const isGuarded = (req: FastifyRequest): boolean =>
      paths.has(req.url.split('?')[0] ?? '');

    fastify.addHook('onRequest', async (req, reply) => {
      if (!isGuarded(req)) return;
      reply.header('content-type', JSON_CONTENT_TYPE);
      reply.header('content-security-policy', 'sandbox');

      const contentType = mediaTypeOf(req.headers['content-type']);
      if (
        !METHODS_WITHOUT_BODY.has(req.method) &&
        contentType !== JSON_CONTENT_TYPE
      ) {
        return reply
          .code(415)
          .send({ message: 'Only application/json is accepted' });
      }

      const accepts = mediaTypesOf(req.headers.accept);
      if (accepts.some((type) => DOCUMENT_MEDIA_TYPES.includes(type))) {
        return reply
          .code(406)
          .send({ message: 'Only application/json is served' });
      }
    });

    fastify.addHook('onSend', async (req, reply, payload) => {
      if (isGuarded(req)) {
        reply.header('content-type', JSON_CONTENT_TYPE);
        reply.header('content-security-policy', 'sandbox');
      }
      return payload;
    });
  },
);
