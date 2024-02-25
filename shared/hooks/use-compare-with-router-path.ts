import { useMemo } from 'react';
import { useRouter } from 'next/router';

import { getConfig } from 'config';
const { ipfsMode } = getConfig();

import {
  compareWithRouterPathInIPFS,
  compareWithRouterPathInInfra,
} from 'utils/compare-with-router-path';

export const useCompareWithRouterPath = (href: string) => {
  const router = useRouter();

  return useMemo(
    () =>
      ipfsMode
        ? compareWithRouterPathInIPFS(router.asPath, href)
        : compareWithRouterPathInInfra(router.asPath, href),
    [router.asPath, href],
  );
};
