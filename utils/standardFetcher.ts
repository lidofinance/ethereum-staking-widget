const DEFAULT_PARAMS = {
  method: 'GET',
  headers: {
    'Content-type': 'application/json',
  },
};

export const standardFetcher = async (
  url: RequestInfo,
  params?: RequestInit,
): Promise<Response> => {
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
