import type { NextApiRequest } from 'next';

/**
 * Builds URLSearchParams for the cache key and upstream URL.
 * When `allowedQueryParams` is set, any other key is dropped.
 *
 * Separate file: lets tests import without pulling in `utilsApi`'s ESM chain.
 */
export const buildParams = (
  query: NextApiRequest['query'],
  ignoreParams: boolean | undefined,
  allowedQueryParams: string[] | undefined,
): URLSearchParams | null => {
  if (ignoreParams) return null;

  const entries = Object.entries(query).filter(
    ([k, v]) =>
      typeof v === 'string' &&
      (!allowedQueryParams || allowedQueryParams.includes(k)),
  );

  if (entries.length === 0) return null;

  return new URLSearchParams(
    entries.reduce(
      (obj, [k, v]) => {
        obj[k] = v as string;
        return obj;
      },
      {} as Record<string, string>,
    ),
  );
};
