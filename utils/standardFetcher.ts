const DEFAULT_PARAMS = {
  method: 'GET',
  headers: {
    'Content-type': 'application/json',
  },
};

export type StandardFetcher = (
  url: RequestInfo,
  params?: RequestInit,
) => Promise<Response>;

export const standardFetcher: StandardFetcher = async (url, params) => {
  const response = await fetch(url, {
    ...DEFAULT_PARAMS,
    ...params,
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }

  const data = await response.json();
  return data;
};
