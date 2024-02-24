import { useMemo } from 'react';
import { useRouter } from 'next/router';

import { getOneConfig } from 'config/one-config/utils';
const { ipfsMode } = getOneConfig();

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
