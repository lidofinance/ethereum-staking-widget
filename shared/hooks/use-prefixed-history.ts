import { useCallback } from 'react';
import { createSearchParams, useNavigate } from 'react-router';

/**
 * Historically these hooks prefixed URLs with the IPFS hash-routing base
 * (`prefixUrl` from utils/get-ipfs-base-path) because the Next.js IPFS
 * build hand-rolled fragment routing. The SPA uses a real hash router in
 * IPFS mode (see app/router.tsx), so navigation is uniform now and these
 * are thin wrappers kept for their call sites.
 */
export const usePrefixedPush = () => {
  const navigate = useNavigate();
  return useCallback(
    (url: string, query?: Record<string, string>) =>
      navigate({
        pathname: url,
        search: query ? createSearchParams(query).toString() : '',
      }),
    [navigate],
  );
};

export const usePrefixedReplace = () => {
  const navigate = useNavigate();
  return useCallback(
    (url: string, query?: Record<string, string>) =>
      navigate(
        {
          pathname: url,
          search: query ? createSearchParams(query).toString() : '',
        },
        { replace: true },
      ),
    [navigate],
  );
};
