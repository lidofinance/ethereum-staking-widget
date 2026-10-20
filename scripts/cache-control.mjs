// Page cache policy, in its own module so it can be unit-tested and imported
// by server.mjs: next.config.mjs runs env loading and build steps on import.

// Set by next.config headers() under this name; server.mjs promotes it to the
// real Cache-Control, overriding whatever Next sets for an ISR page.
export const CACHE_CONTROL_HEADER = 'x-cache-control';

// Browsers revalidate after 15 s and may serve stale for 2 days while doing so;
// shared caches (Cloudflare) keep a copy for 30 s and up to 7 days on error.
export const CACHE_CONTROL_VALUE =
  'public, max-age=15, s-maxage=30, stale-if-error=604800, stale-while-revalidate=172800';

/**
 * Lets next.config headers() win over the Cache-Control Next sets for an ISR
 * page. headers() cannot set Cache-Control directly (Next overwrites it when it
 * sends the page), so it sets CACHE_CONTROL_HEADER instead and this hook
 * promotes that to the real Cache-Control and drops Next's later value.
 * @param {import('node:http').ServerResponse} res
 */
export const overrideCacheControl = (res) => {
  // bound like the CSP hook: the hook is installed per response
  const setHeader = res.setHeader.bind(res);
  let cacheControlOverwritten = false;
  res.setHeader = function (header, value) {
    if (header.toLowerCase() === CACHE_CONTROL_HEADER) {
      cacheControlOverwritten = true;

      return setHeader('Cache-Control', value);
    }

    if (header.toLowerCase() === 'cache-control' && cacheControlOverwritten) {
      return this;
    }

    return setHeader(header, value);
  };
};
