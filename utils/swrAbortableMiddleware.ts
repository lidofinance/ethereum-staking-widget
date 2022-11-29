import { useEffect, useMemo } from 'react';
import { Middleware, unstable_serialize } from 'swr';
import { standardFetcher } from 'utils/standardFetcher';

export const swrAbortableMiddleware: Middleware = (useSWRNext) => {
  return (key, fetcher, config) => {
    const cacheKey = unstable_serialize(key);

    // for each key generate new AbortController
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const abortController = useMemo(() => new AbortController(), [cacheKey]);

    // as soon as abortController is changed or component is unmounted, call abort
    useEffect(() => () => abortController.abort(), [abortController]);

    // pass signal to your fetcher in way you prefer
    const fetcherExtended: typeof fetcher = (url, params) =>
      standardFetcher(url, { ...params, signal: abortController.signal });

    return useSWRNext(key, fetcherExtended, config);
  };
};
