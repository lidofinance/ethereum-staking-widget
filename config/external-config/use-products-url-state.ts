import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import {
  isProductQueryKey,
  parseProductsUrlState,
  toProductQuery,
  type ProductQuery,
  type ProductsUrlState,
} from './products';

type QueryEntries = [string, string][];

// product params for the page load, so a navigation that loses them keeps the limits; client only
let cachedEntries: QueryEntries | undefined;

// product params in URL order; repeated params keep their values
const getProductEntries = (searchParams: URLSearchParams): QueryEntries =>
  [...searchParams.entries()].filter(([key]) => isProductQueryKey(key));

// URL product params, or the cached ones when the URL has none
const useProductEntries = (): QueryEntries => {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const entries = getProductEntries(searchParams);
    if (entries.length > 0 && typeof window !== 'undefined') {
      cachedEntries = entries;
    }

    return entries.length > 0 ? entries : (cachedEntries ?? []);
  }, [searchParams]);
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
