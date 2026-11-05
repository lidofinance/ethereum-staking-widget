import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { useProductQuery } from 'config/external-config/use-products-url-state';
import { prefixUrl } from 'utils/get-ipfs-base-path';

// prefixUrl with product params; the given query wins
const usePrefixUrlWithProducts = () => {
  const productQuery = useProductQuery();
  return useCallback(
    (url: string, query?: Record<string, string>) =>
      prefixUrl(url, { ...productQuery, ...query }),
    [productQuery],
  );
};

export const usePrefixedPush = () => {
  const router = useRouter();
  const prefix = usePrefixUrlWithProducts();
  type Args = Parameters<typeof router.push>;
  return useCallback(
    (
      url: string,
      query?: Record<string, string>,
      a1?: Args[1],
      a2?: Args[2],
    ) => {
      return router.push(prefix(url, query), a1, a2);
    },
    [router, prefix],
  );
};

export const usePrefixedReplace = () => {
  const router = useRouter();
  const prefix = usePrefixUrlWithProducts();
  type Args = Parameters<typeof router.replace>;
  return useCallback(
    (
      url: string,
      query?: Record<string, string>,
      a1?: Args[1],
      a2?: Args[2],
    ) => {
      return router.replace(prefix(url, query), a1, a2);
    },
    [router, prefix],
  );
};
