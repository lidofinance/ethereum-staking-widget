import { useCallback } from 'react';
import { createSearchParams, useNavigate } from 'react-router';

import { useProductQuery } from 'config/external-config/use-products-url-state';

/**
 * Historically these hooks prefixed URLs with the IPFS hash-routing base
 * (`prefixUrl` from utils/get-ipfs-base-path) because the Next.js IPFS
 * build hand-rolled fragment routing. The SPA uses a real hash router in
 * IPFS mode (see app/router.tsx), so navigation is uniform now and these
 * are thin wrappers kept for their call sites.
 */

// search string with product params; the given query wins
const useSearchWithProducts = () => {
  const productQuery = useProductQuery();
  return useCallback(
    (query?: Record<string, string>) =>
      createSearchParams({ ...productQuery, ...query }).toString(),
    [productQuery],
  );
};

export const usePrefixedPush = () => {
  const navigate = useNavigate();
  const toSearch = useSearchWithProducts();
  return useCallback(
    (url: string, query?: Record<string, string>) =>
      navigate({ pathname: url, search: toSearch(query) }),
    [navigate, toSearch],
  );
};

export const usePrefixedReplace = () => {
  const navigate = useNavigate();
  const toSearch = useSearchWithProducts();
  return useCallback(
    (url: string, query?: Record<string, string>) =>
      navigate({ pathname: url, search: toSearch(query) }, { replace: true }),
    [navigate, toSearch],
  );
};
