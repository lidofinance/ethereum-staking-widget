import { useCallback } from 'react';
import { useRouter } from 'next/router';

/**
 * Historically these hooks prefixed URLs with the IPFS hash-routing base
 * (`prefixUrl` from utils/get-ipfs-base-path) because the Next.js IPFS
 * build hand-rolled fragment routing. The SPA uses a real hash router in
 * IPFS mode (see app/router.tsx), so navigation is uniform now and these
 * are thin wrappers kept for their call sites.
 */
export const usePrefixedPush = () => {
  const router = useRouter();
  return useCallback(
    (url: string, query?: Record<string, string>) =>
      router.push({ pathname: url, query }),
    [router],
  );
};

export const usePrefixedReplace = () => {
  const router = useRouter();
  return useCallback(
    (url: string, query?: Record<string, string>) =>
      router.replace({ pathname: url, query }),
    [router],
  );
};
