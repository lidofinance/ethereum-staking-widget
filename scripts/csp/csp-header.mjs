import { createRequire } from 'node:module';

// next-secure-headers is CJS; loaded the way next.config.mjs loads its CJS deps
const require = createRequire(import.meta.url);
const { createHeadersObject } = require('next-secure-headers');

const CSP_HEADER_NAMES = [
  'content-security-policy',
  'content-security-policy-report-only',
];

/**
 * The CSP header for the policy, as [name, value]: enforced or report-only,
 * per the policy's `reportOnly`
 * @param {object} contentSecurityPolicy - see scripts/csp/content-security-policy.mjs
 * @returns {[string, string]}
 */
export const createCspHeader = (contentSecurityPolicy) => {
  const header = Object.entries(
    createHeadersObject({ contentSecurityPolicy }),
  ).find(([name]) => CSP_HEADER_NAMES.includes(name.toLowerCase()));
  if (!header) throw new Error('[csp] the policy produced no header');
  return header;
};

const isHtml = (contentType) =>
  typeof contentType === 'string' &&
  contentType.toLowerCase().startsWith('text/html');

// A header out of the object form of writeHead(status[, message][, headers])
const headerOf = (headers, name) => {
  if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
    return undefined;
  }
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name);
  return key === undefined ? undefined : headers[key];
};

/**
 * Sets the CSP header on every HTML response of the server. The server is
 * the one place that sets it: Next renders the pages statically (ISR), so
 * nothing in the app runs per request for a page served from the cache.
 * Hooks writeHead, which Node calls for explicit and implicit header flushes.
 *
 * A 304 is sent too: Next answers a matching ETag before it sets Content-Type,
 * and the browser merges 304 headers into its cached copy, so a policy that is
 * not resent stays pinned to whatever the cached 200 carried. Asset 304s get
 * the header as well, which is harmless.
 * @param {import('node:http').ServerResponse} res
 * @param {() => [string, string]} getCspHeader
 */
export const setCspHeaderOnHtml = (res, getCspHeader) => {
  const writeHead = res.writeHead.bind(res);
  res.writeHead = function (statusCode, ...rest) {
    const headers = rest.find((arg) => arg && typeof arg === 'object');
    const contentType =
      this.getHeader('content-type') ?? headerOf(headers, 'content-type');
    if (statusCode === 304 || isHtml(contentType)) {
      const [name, value] = getCspHeader();
      this.setHeader(name, value);
    }
    return writeHead(statusCode, ...rest);
  };
};
