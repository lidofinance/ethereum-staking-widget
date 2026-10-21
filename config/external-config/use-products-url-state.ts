import { useMemo } from 'react';
import { useRouter } from 'next/router';

import {
  PRODUCT_QUERY_KEYS,
  parseProductsUrlState,
  toProductQuery,
  type ProductQuery,
  type ProductsUrlState,
} from './products';

type QueryEntries = [string, string][];

// product params for the page load, so a navigation that loses them keeps the limits; client only
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

// URL product params, or the cached ones when the URL has none
const useProductEntries = (): QueryEntries => {
  const { query, isReady } = useRouter();

  return useMemo(() => {
    if (!isReady) return [];

    const entries = getProductEntries(query);
    if (entries.length > 0 && typeof window !== 'undefined') {
      cachedEntries = entries;
    }

    return entries.length > 0 ? entries : (cachedEntries ?? []);
  }, [query, isReady]);
};

/**
 * Products state from `product`, `stake`, `earn` and `swap` URL params.
 * Works before Wagmi is mounted, so it can be used in ConfigProvider.
 */
export const useProductsUrlState = (): ProductsUrlState => {
  const entries = useProductEntries();
  return useMemo(() => parseProductsUrlState(entries), [entries]);
};

// product params for internal navigations, so the URL matches the products state
export const useProductQuery = (): ProductQuery => {
  const entries = useProductEntries();
  return useMemo(() => toProductQuery(entries), [entries]);
};
