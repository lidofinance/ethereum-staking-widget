import { extractErrorMessage } from 'utils';
import { FetcherError } from './fetcherError';

const DEFAULT_PARAMS = {
  method: 'GET',
  headers: {
    'Content-type': 'application/json',
  },
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
