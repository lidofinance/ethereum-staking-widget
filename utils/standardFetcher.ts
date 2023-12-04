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

type StandardFetcher = <T>(url: string, params?: RequestInit) => Promise<T>;

export const standardFetcher: StandardFetcher = async (url, params) => {
  const response = await fetch(url, {
    ...DEFAULT_PARAMS,
    ...params,
  });

  if (!response.ok) {
    throw new FetcherError(await extractError(response), response.status);
  }

  return await response.json();
};
