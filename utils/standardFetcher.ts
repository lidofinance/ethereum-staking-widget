// direct group import, not the `config` barrel: the barrel reaches this module
// back through provider -> external-config
import { USER_AGENT } from 'config/groups/app';
import { extractErrorMessage } from 'utils';
import { FetcherError } from './fetcherError';

// User-Agent is a forbidden header in browsers, so only set it server-side —
// in the browser fetch would strip it anyway.
const USER_AGENT_HEADER: Record<string, string> =
  typeof window === 'undefined' ? { 'User-Agent': USER_AGENT } : {};

const DEFAULT_PARAMS = {
  method: 'GET',
  headers: {
    'Content-type': 'application/json',
    ...USER_AGENT_HEADER,
  },
};

// callers pass their own `headers`, which would otherwise drop the defaults
const mergeHeaders = (extra?: HeadersInit): Headers => {
  const merged = new Headers(DEFAULT_PARAMS.headers);
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

export const standardFetcher: StandardFetcher = async (url, params) => {
  const { timeoutMs, ...fetchParams } = params || {};
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

  const response = await fetch(url, {
    ...DEFAULT_PARAMS,
    ...fetchParams,
    headers: mergeHeaders(fetchParams.headers),
    signal: controller.signal,
  });

  if (timeout) {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new FetcherError(await extractError(response), response.status);
  }

  return await response.json();
};
