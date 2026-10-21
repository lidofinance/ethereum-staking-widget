import { useState, useCallback, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/router';

import { useRouterPath } from 'shared/hooks/use-router-path';
import { useConfig } from 'config';
import { isDisabledPath } from 'config/external-config';
import { getHomePath, withProductQuery } from 'config/external-config/products';
import {
  useProductQuery,
  useProductsUrlState,
} from 'config/external-config/use-products-url-state';

import { LayoutEffectSsrDelayed } from 'shared/components/layout-effect-ssr-delayed';

export const ExternalForbiddenRouteProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [showContent, setShowContent] = useState(true);
  const router = useRouter();
  const path = useRouterPath();
  const { pages } = useConfig().externalConfig;
  const productsUrlState = useProductsUrlState();
  const productQuery = useProductQuery();

  const checkPathEffect = useCallback(() => {
    if (pages && isDisabledPath(path, pages)) {
      setShowContent(false);
      // Extract dynamic path segment names (e.g. [vault], [action]) to exclude them from query
      const dynamicParams = new Set(
        router.pathname.match(/\[(\w+)\]/g)?.map((p) => p.slice(1, -1)) ?? [],
      );
      const query = withProductQuery(
        Object.fromEntries(
          Object.entries(router.query).filter(
            ([key]) => !dynamicParams.has(key),
          ),
        ),
        productQuery,
      );
      // `/` when stake is enabled, else the first enabled product
      void router
        .push({ pathname: getHomePath(productsUrlState, pages), query })
        .finally(() => setShowContent(true));
    }
  }, [pages, path, router, productsUrlState, productQuery]);

  const effectDeps = useMemo(() => [pages, path], [pages, path]);

  return (
    <>
      <LayoutEffectSsrDelayed effect={checkPathEffect} deps={effectDeps} />
      {showContent && children}
    </>
  );
};
