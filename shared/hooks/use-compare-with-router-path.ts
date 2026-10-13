import { useMemo } from 'react';
import { useLocation } from 'react-router';

import { config } from 'config';
import {
  compareWithRouterPathInIPFS,
  compareWithRouterPathInInfra,
} from 'utils/compare-with-router-path';

export const useCompareWithRouterPath = (href: string) => {
  const { pathname, search } = useLocation();

  return useMemo(() => {
    const asPath = `${pathname}${search}`;
    return config.ipfsMode
      ? compareWithRouterPathInIPFS(asPath, href)
      : compareWithRouterPathInInfra(asPath, href);
  }, [pathname, search, href]);
};
