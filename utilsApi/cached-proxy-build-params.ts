import type { NextApiRequest } from 'next';

/**
 * Builds the URLSearchParams used for both the cache key and the upstream URL
 * inside `createCachedProxy`. When `allowedQueryParams` is set, any query key
 * outside the allow-list is dropped — this prevents attacker-padded query
 * strings from blowing up cache cardinality AND from reaching the upstream.
 *
 * Lives in its own file so unit tests can import it without pulling in the
 * `utilsApi` index re-export chain (which transitively imports project `.mjs`
 * ESM files that Jest can't parse without extra config).
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
