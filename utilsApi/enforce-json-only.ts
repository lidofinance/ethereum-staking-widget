import type { RequestWrapper } from '@lidofinance/next-api-wrapper';

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

const mediaTypeOf = (header: string | string[] | undefined) => {
  const value = Array.isArray(header) ? header[0] : header;
  return value?.split(';')[0]?.trim().toLowerCase() ?? '';
};

const mediaTypesOf = (header: string | string[] | undefined) => {
  const value = Array.isArray(header) ? header.join(',') : header;
  return (value ?? '')
    .split(',')
    .map((entry) => entry.split(';')[0]?.trim().toLowerCase() ?? '')
    .filter(Boolean);
};

/**
 * Keeps a proxy route JSON in both directions, so no reply of an upstream
 * can run as a document under the widget origin
 *
 * Request: the body must be JSON (an HTML form can only send urlencoded,
 * multipart or text/plain, so this alone stops a form navigation), and
 * `Accept` must not ask for a document type. An absent `Accept` and the
 * wildcard pass, which is what fetch clients send.
 *
 * Response: `Content-Type` is pinned to JSON whatever the handler or its
 * upstream sets, and a sandbox CSP gives any reply that is still rendered as
 * a document an opaque origin.
 */
export const enforceJsonOnly: RequestWrapper = async (req, res, next) => {
  const setHeader = res.setHeader.bind(res);
  res.setHeader = function (name, value) {
    if (name.toLowerCase() === 'content-type') {
      return setHeader('Content-Type', JSON_CONTENT_TYPE);
    }
    return setHeader(name, value);
  };
  setHeader('Content-Type', JSON_CONTENT_TYPE);
  setHeader('Content-Security-Policy', 'sandbox');

  const contentType = mediaTypeOf(req.headers['content-type']);
  if (
    !METHODS_WITHOUT_BODY.has(req.method ?? '') &&
    contentType !== JSON_CONTENT_TYPE
  ) {
    res.status(415).json({ message: 'Only application/json is accepted' });
    return;
  }

  const accepts = mediaTypesOf(req.headers.accept);
  if (accepts.some((type) => DOCUMENT_MEDIA_TYPES.includes(type))) {
    res.status(406).json({ message: 'Only application/json is served' });
    return;
  }

  await next?.(req, res, next);
};
