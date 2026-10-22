// Page cache policy, in its own module so it can be unit-tested and imported
// by server.mjs: next.config.mjs runs env loading and build steps on import.

// Set by next.config headers() under this name; server.mjs promotes it to the
// real Cache-Control, overriding whatever Next sets for an ISR page.
export const CACHE_CONTROL_HEADER = 'x-cache-control';

// Browsers revalidate after 15 s and may serve stale for 2 days while doing so;
// shared caches (Cloudflare) keep a copy for 30 s and up to 7 days on error.
export const CACHE_CONTROL_VALUE =
  'public, max-age=15, s-maxage=30, stale-if-error=604800, stale-while-revalidate=172800';

// next.config headers() match on path only, so a 404 or a render failure on a
// cached path would carry the public policy and sit in shared caches for days.
export const CACHE_CONTROL_ERROR_VALUE = 'no-store';

const isCacheControl = (header) =>
  typeof header === 'string' && header.toLowerCase() === 'cache-control';

/**
 * The headers argument of writeHead as [name, value] pairs. Node accepts it as
 * an object, as a list of pairs or as a flat name/value list, and takes the
 * pairs back.
 * @param {Record<string, unknown> | unknown[]} headers
 * @returns {[unknown, unknown][]}
 */
const toHeaderPairs = (headers) => {
  if (!Array.isArray(headers)) return Object.entries(headers);
  if (Array.isArray(headers[0])) return headers;
  return headers.flatMap((item, i) =>
    i % 2 === 0 ? [[item, headers[i + 1]]] : [],
  );
};

/**
 * Lets next.config headers() win over the Cache-Control Next sets for an ISR
 * page. headers() cannot set Cache-Control directly (Next overwrites it when it
 * sends the page), so it sets CACHE_CONTROL_HEADER instead and this hook
 * promotes that to the real Cache-Control and drops Next's later value.
 *
 * Whatever was set, a 4xx/5xx response goes out as `no-store`: the status is
 * only known when the head is written, so that is where the policy is applied.
 * @param {import('node:http').ServerResponse} res
 */
export const overrideCacheControl = (res) => {
  // bound like the CSP hook: the hook is installed per response
  const setHeader = res.setHeader.bind(res);
  const writeHead = res.writeHead.bind(res);
  let cacheControlOverwritten = false;
  res.setHeader = function (header, value) {
    if (header.toLowerCase() === CACHE_CONTROL_HEADER) {
      cacheControlOverwritten = true;

      return setHeader('Cache-Control', value);
    }

    if (isCacheControl(header) && cacheControlOverwritten) {
      return this;
    }

    return setHeader(header, value);
  };
  res.writeHead = function (statusCode, ...rest) {
    if (statusCode < 400) return writeHead(statusCode, ...rest);

    // headers passed to writeHead take precedence over setHeader ones
    const headers = rest.at(-1);
    if (headers && typeof headers === 'object') {
      rest[rest.length - 1] = toHeaderPairs(headers).filter(
        ([header]) => !isCacheControl(header),
      );
    }
    setHeader('Cache-Control', CACHE_CONTROL_ERROR_VALUE);

    return writeHead(statusCode, ...rest);
  };
};
