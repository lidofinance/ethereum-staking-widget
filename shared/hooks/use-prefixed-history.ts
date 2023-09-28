import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { prefixUrl } from 'utils/get-ipfs-base-path';

export const usePrefixedPush = () => {
  const router = useRouter();
  type Args = Parameters<typeof router.push>;
  return useCallback(
    (url: string, a1?: Args[1], a2?: Args[2]) => {
      return router.push(prefixUrl(url), a1, a2);
    },
    [router],
  );
};

export const usePrefixedReplace = () => {
  const router = useRouter();
  type Args = Parameters<typeof router.replace>;
  return useCallback(
    (url: string, a1?: Args[1], a2?: Args[2]) => {
      return router.replace(prefixUrl(url), a1, a2);
    },
    [router],
  );
};
