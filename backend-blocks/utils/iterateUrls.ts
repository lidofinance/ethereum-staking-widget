import { Response } from 'node-fetch';

export class ExhaustedIterationError extends Error {
  constructor(message?: string) {
    super(message ?? 'Iteration ended without success');
  }
}

export const iterateUrls = async <T>(
  urls: [string, ...string[]],
  callback: (url: string) => T,
  onError?: (error: unknown) => unknown,
): Promise<T> => {
  let lastResponse: T | undefined;
  let lastError: unknown | undefined;

  for (const url of urls) {
    try {
      const response = await callback(url);
      lastResponse = response;

      // We want to return first succeeded response
      if (response instanceof Response && !response.ok) {
        continue;
      }

      return response;
    } catch (error) {
      onError?.(error);
      lastError = error;
    }
  }

  // If there are no succeeded responses, return last not thrown
  if (lastResponse != null) {
    return lastResponse;
  }
  // If there are no responses at all, throw last error
  if (lastError != null) {
    throw lastError;
  }
  // This should not be reachable
  throw new ExhaustedIterationError();
};
