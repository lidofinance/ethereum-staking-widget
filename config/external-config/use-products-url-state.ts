import { useMemo } from 'react';
import { useRouter } from 'next/router';

import {
  PRODUCT_QUERY_KEYS,
  parseProductsUrlState,
  type ProductsUrlState,
} from './products';

type QueryEntries = [string, string][];

// keeps product params across iframe rerenders, where the router can lose the query; client only
let cachedEntries: QueryEntries | undefined;

// product params in URL order; repeated params keep their values
const getProductEntries = (query: ReturnType<typeof useRouter>['query']) =>
  Object.entries(query).flatMap(([key, value]): QueryEntries => {
    if (!(PRODUCT_QUERY_KEYS as readonly string[]).includes(key)) return [];
    const values = Array.isArray(value) ? value : [value];
    return values
      .filter((item): item is string => typeof item === 'string')
      .map((item) => [key, item]);
  });

/**
 * Products state from `product`, `stake`, `earn` and `swap` URL params.
 * Works before Wagmi is mounted, so it can be used in ConfigProvider.
 */
export const useProductsUrlState = (): ProductsUrlState => {
  const { query, isReady } = useRouter();

  return useMemo(() => {
    if (!isReady) return parseProductsUrlState([]);

    const entries = getProductEntries(query);
    if (entries.length > 0 && typeof window !== 'undefined') {
      cachedEntries = entries;
    }

    return parseProductsUrlState(
      entries.length > 0 ? entries : (cachedEntries ?? []),
    );
  }, [query, isReady]);
};
