import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

import { config } from 'config';
import { useProductQuery } from 'config/external-config/use-products-url-state';
import { usePrefixedPush } from 'shared/hooks/use-prefixed-history';

const PRESERVED_QUERY_KEYS = [
  'ref',
  'embed',
  'app',
  'theme',
  'forceAllowance',
] as const;

// Query parameters that every in-app navigation keeps
export const usePreservedQueryParams = (): Record<string, string> => {
  const router = useRouter();
  const productQuery = useProductQuery();

  return useMemo(() => {
    const preservedQuery: Record<string, string> = {};
    // Skip repeated query parameters because the router returns them as arrays,
    // e.g. ?param=01234&param=56789
    for (const key of PRESERVED_QUERY_KEYS) {
      const value = router.query[key];
      if (value && typeof value === 'string') preservedQuery[key] = value;
    }
    // Keep product URL parameters across navigation, using cached values when the current URL has none.
    return Object.assign(preservedQuery, productQuery);
  }, [router.query, productQuery]);
};

// Navigation from code with the same rules as LocalLink (preserved query, IPFS hash routing)
export const useLocalNavigate = () => {
  const router = useRouter();
  const prefixedPush = usePrefixedPush();
  const preservedQuery = usePreservedQueryParams();

  return useCallback(
    (href: string, options?: { scroll?: boolean }) => {
      if (config.ipfsMode) {
        return prefixedPush(href, preservedQuery, undefined, options);
      }
      return router.push(
        { pathname: href, query: preservedQuery },
        undefined,
        options,
      );
    },
    [router, prefixedPush, preservedQuery],
  );
};
