import { type Transport, BaseError, HttpRequestError } from 'viem';

// a hostile or misconfigured RPC must not bench itself for good
const MAX_RETRY_AFTER_MS = 2 * 60 * 1000;

// IMF-fixdate, the only HTTP date format a server may send
const HTTP_DATE =
  /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/;

// Retry-After is either delay-seconds or an HTTP date. Anything else (a
// fraction, a header duplicated by a proxy) is ignored instead of being
// handed to Date.parse, which reads loose strings as legacy dates.
// An HTTP date is measured against the client clock, so a skewed clock skips
// or stretches the bench (up to the cap). Accepted: our /api/rpc sends
// delay-seconds only, which does not depend on the clock
const parseRetryAfter = (header: string, now: number): number | null => {
  const value = header.trim();
  let delay: number;
  if (/^\d+$/.test(value)) delay = Number.parseInt(value, 10) * 1000;
  else if (HTTP_DATE.test(value)) delay = Date.parse(value) - now;
  else return null;
  if (!Number.isFinite(delay) || delay <= 0) return null;
  return Math.min(delay, MAX_RETRY_AFTER_MS);
};

// A relative url (our backend during SSR) resolves to one placeholder host
const getHost = (url: string | undefined): string => {
  if (!url) return '';
  try {
    return new URL(url, 'http://relative.invalid').host;
  } catch {
    return url;
  }
};

// The delay and the host that asked for it. Only an HTTP-level failure
// carries the header: a non-OK response whose body is a JSON-RPC error is
// surfaced by viem as a plain RPC error without headers and does not bench
// (our /api/rpc answers 429 with `{ message }`, so it does)
const getRetryAfter = (
  error: unknown,
  now: number,
): { host: string; delay: number } | null => {
  if (!(error instanceof BaseError)) return null;
  const httpError = error.walk((e) => e instanceof HttpRequestError);
  if (!(httpError instanceof HttpRequestError)) return null;
  const header = httpError.headers?.get('Retry-After');
  const delay = header ? parseRetryAfter(header, now) : null;
  return delay ? { host: getHost(httpError.url), delay } : null;
};

// Thrown for a request that was not sent because the RPC is benched. A fresh
// error per request: the one that started the bench carries another request's
// body and url
export class RetryAfterActiveError extends BaseError {
  constructor(blockedUntil: number) {
    super('RPC is skipped until its Retry-After delay is over.', {
      details: `Retry after ${new Date(blockedUntil).toISOString()}`,
      name: 'RetryAfterActiveError',
    });
  }
}

// Makes a transport honour Retry-After: once the RPC answers with the header
// (our /api/rpc does on 429), requests fail fast with RetryAfterActiveError
// until the delay is over instead of reaching the network. Inside a fallback
// stack this skips the benched RPC and lets the next transport serve meanwhile.
// The header is only readable same-origin or when the RPC exposes it via CORS.
export const retryAfterTransport = (transport: Transport): Transport => {
  // Benches are kept per host, so a delay only ever applies to the host that
  // asked for it, whatever url the wrapped transport resolves to (an `http`
  // transport without a url takes it from the chain it is instantiated for).
  // The map lives with this wrapper and is shared by its instances: fallback
  // instantiates the transport per request
  const blockedUntilByHost = new Map<string, number>();

  return (params) => {
    const instance = transport(params);
    const host = getHost((instance.value as { url?: string } | undefined)?.url);

    return {
      ...instance,
      request: async (args, options) => {
        const blockedUntil = blockedUntilByHost.get(host);
        if (blockedUntil !== undefined) {
          if (Date.now() < blockedUntil) {
            throw new RetryAfterActiveError(blockedUntil);
          }
          blockedUntilByHost.delete(host);
        }
        try {
          return await instance.request(args, options);
        } catch (error) {
          const now = Date.now();
          const retryAfter = getRetryAfter(error, now);
          if (retryAfter) {
            // only ever extended: a request that was already in flight may
            // come back later with a shorter delay
            blockedUntilByHost.set(
              retryAfter.host,
              Math.max(
                blockedUntilByHost.get(retryAfter.host) ?? 0,
                now + retryAfter.delay,
              ),
            );
          }
          throw error;
        }
      },
    };
  };
};
