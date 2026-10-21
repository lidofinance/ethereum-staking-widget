import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { useProductQuery } from 'config/external-config/use-products-url-state';
import { prefixUrl } from 'utils/get-ipfs-base-path';

export const usePrefixedPush = () => {
  const router = useRouter();
  const productQuery = useProductQuery();
  type Args = Parameters<typeof router.push>;
  return useCallback(
    (
      url: string,
      query?: Record<string, string>,
      a1?: Args[1],
      a2?: Args[2],
    ) => {
      return router.push(prefixUrl(url, { ...productQuery, ...query }), a1, a2);
    },
    [router, productQuery],
  );
};

export const usePrefixedReplace = () => {
  const router = useRouter();
  const productQuery = useProductQuery();
  type Args = Parameters<typeof router.replace>;
  return useCallback(
    (
      url: string,
      query?: Record<string, string>,
      a1?: Args[1],
      a2?: Args[2],
    ) => {
      return router.replace(
        prefixUrl(url, { ...productQuery, ...query }),
        a1,
        a2,
      );
    },
    [router, productQuery],
  );
};
