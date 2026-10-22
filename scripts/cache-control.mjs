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

const isHeader = (header, name) =>
  typeof header === 'string' && header.toLowerCase() === name;

/**
 * Lets next.config headers() win over the Cache-Control Next sets for an ISR
 * page. headers() cannot set Cache-Control directly (Next overwrites it when it
 * sends the page), so it sets CACHE_CONTROL_HEADER instead and this hook
 * promotes that to the real Cache-Control and drops Next's later value.
 *
 * Whatever was set, a 4xx/5xx response goes out as `no-store`: the status is
 * only known when the head is written, so that is where the policy is applied.
 *
 * Once the override or the error policy has set Cache-Control it is final:
 * later writes through the header API are dropped. Node merges the headers
 * passed to writeHead through that same API (setHeader for an object,
 * removeHeader + appendHeader for a flat list), so they are covered without
 * this hook knowing their shape. Should Node ever merge them another way the
 * hook degrades to that Cache-Control winning, never to a broken response.
 * @param {import('node:http').ServerResponse} res
 */
export const overrideCacheControl = (res) => {
  // bound like the CSP hook: the hook is installed per response
  const setHeader = res.setHeader.bind(res);
  const appendHeader = res.appendHeader.bind(res);
  const removeHeader = res.removeHeader.bind(res);
  const writeHead = res.writeHead.bind(res);
  // set once the override or the error policy wrote Cache-Control: from then
  // on every other write of it is dropped
  let cacheControlLocked = false;

  res.setHeader = function (header, value) {
    if (isHeader(header, CACHE_CONTROL_HEADER)) {
      cacheControlLocked = true;

      return setHeader('Cache-Control', value);
    }

    if (cacheControlLocked && isHeader(header, 'cache-control')) {
      return this;
    }

    return setHeader(header, value);
  };
  res.appendHeader = function (header, value) {
    if (cacheControlLocked && isHeader(header, 'cache-control')) {
      return this;
    }

    return appendHeader(header, value);
  };
  res.removeHeader = function (header) {
    if (cacheControlLocked && isHeader(header, 'cache-control')) {
      return;
    }

    return removeHeader(header);
  };
  res.writeHead = function (statusCode, ...rest) {
    if (Number(statusCode) >= 400) {
      setHeader('Cache-Control', CACHE_CONTROL_ERROR_VALUE);
      cacheControlLocked = true;
    }

    return writeHead(statusCode, ...rest);
  };
};
