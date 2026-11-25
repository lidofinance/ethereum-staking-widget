// direct group import, not the `config` barrel: the barrel reaches this module
// back through provider -> external-config
import { USER_AGENT } from 'config/groups/app';
// Import the concrete module, NOT the `utils` barrel — the barrel pulls
// React (formatBalance) and wagmi (getErrorMessage → modules/web3), which
// must stay out of the api server's bundle (server imports this fetcher's
// consumers, e.g. features/earn/vault-*/utils.ts).
import { extractErrorMessage } from './extractErrorMessage';
import { FetcherError } from './fetcherError';

// User-Agent is a forbidden header in browsers, so only set it server-side —
// in the browser fetch would strip it anyway.
const USER_AGENT_HEADER: Record<string, string> =
  typeof window === 'undefined' ? { 'User-Agent': USER_AGENT } : {};

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-type': 'application/json',
  ...USER_AGENT_HEADER,
};

const DEFAULT_PARAMS = {
  method: 'GET',
  headers: DEFAULT_HEADERS,
};

// callers pass their own `headers`, which would otherwise drop the defaults
// Content-Type only with a body: on a bodyless GET it forces a CORS preflight
const mergeHeaders = (
  extra: HeadersInit | undefined,
  hasBody: boolean,
): Headers => {
  const merged = new Headers(hasBody ? DEFAULT_HEADERS : USER_AGENT_HEADER);
  new Headers(extra).forEach((value, key) => merged.set(key, value));
  return merged;
};

const extractError = async (response: Response) => {
  try {
    const error = await response.json();
    return extractErrorMessage(error);
  } catch (error) {
    return 'An error occurred while fetching the data';
  }
};

type StandardFetcherParams = RequestInit & {
  timeoutMs?: number;
};

type StandardFetcher = <T>(
  url: string,
  params?: StandardFetcherParams,
) => Promise<T>;

// AbortSignal.any is missing in older browsers in our browserslist (Safari < 17.4)
const combineSignals = (signals: AbortSignal[]): AbortSignal => {
  const controller = new AbortController();
  const cleanups: (() => void)[] = [];
  const abortWith = (signal: AbortSignal) => {
    controller.abort(signal.reason);
    cleanups.forEach((cleanup) => cleanup());
  };
  for (const signal of signals) {
    if (signal.aborted) {
      abortWith(signal);
      break;
    }
    const onAbort = () => abortWith(signal);
    signal.addEventListener('abort', onAbort, { once: true });
    cleanups.push(() => signal.removeEventListener('abort', onAbort));
  }
  return controller.signal;
};

export const standardFetcher: StandardFetcher = async (url, params) => {
  const { timeoutMs, signal: callerSignal, ...fetchParams } = params || {};
  const controller = new AbortController();
  const timeout = timeoutMs
    ? setTimeout(
        () =>
          controller.abort(
            new FetcherError(`Request timed out after ${timeoutMs} ms`, 500),
          ),
        timeoutMs,
      )
    : null;

  // the caller's signal and the timeout both abort the request
  const signal = callerSignal
    ? combineSignals([callerSignal, controller.signal])
    : controller.signal;

  try {
    const response = await fetch(url, {
      ...DEFAULT_PARAMS,
      ...fetchParams,
      headers: mergeHeaders(fetchParams.headers, fetchParams.body != null),
      signal,
    });

    if (!response.ok) {
      throw new FetcherError(await extractError(response), response.status);
    }

    return await response.json();
  } finally {
    // also covers a stalled body and a thrown error
    if (timeout) clearTimeout(timeout);
  }
};
