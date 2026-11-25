import type { ParsedUrlQuery } from 'querystring';

// ParsedUrlQuery without undefined values, as accepted by createSearchParams
export const toSearchParamsInit = (
  query: ParsedUrlQuery,
): Record<string, string | string[]> =>
  Object.fromEntries(
    Object.entries(query).filter(
      (entry): entry is [string, string | string[]] => entry[1] !== undefined,
    ),
  );
