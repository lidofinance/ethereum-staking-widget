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

// Pick<RequestInit, 'headers'> || Headers
type FetcherWithServiceResponse = <T>(
  url: string,
  params?: RequestInit,
) => Promise<{ data: T; headers: Headers }>;

export const fetcherWithServiceResponse: FetcherWithServiceResponse = async (
  url,
  params,
) => {
  const requestInit = {
    ...DEFAULT_PARAMS,
    ...params,
  };

  const response = await fetch(url, requestInit);

  if (!response.ok) {
    throw new FetcherError(await extractError(response), response.status);
  }

  if (
    requestInit?.headers &&
    'Content-type' in requestInit.headers &&
    requestInit.headers['Content-type'].indexOf('text/html') > -1
  ) {
    return {
      data: await response.text(),
      headers: response.headers,
    };
  }

  return {
    data: await response.json(),
    headers: response.headers,
  };
};
