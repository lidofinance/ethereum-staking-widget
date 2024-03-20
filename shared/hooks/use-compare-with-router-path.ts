import { useMemo } from 'react';
import { useRouter } from 'next/router';

import { config } from 'config';
import {
  compareWithRouterPathInIPFS,
  compareWithRouterPathInInfra,
} from 'utils/compare-with-router-path';

export const useCompareWithRouterPath = (href: string) => {
  const router = useRouter();

  return useMemo(
    () =>
      config.ipfsMode
        ? compareWithRouterPathInIPFS(router.asPath, href)
        : compareWithRouterPathInInfra(router.asPath, href),
    [router.asPath, href],
  );
};
