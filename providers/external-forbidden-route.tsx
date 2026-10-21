import { useState, useCallback, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/router';

import { useRouterPath } from 'shared/hooks/use-router-path';
import { useConfig } from 'config';
import { isDisabledPath } from 'config/external-config';
import { getHomePath } from 'config/external-config/products';
import { useProductsUrlState } from 'config/external-config/use-products-url-state';

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

  const checkPathEffect = useCallback(() => {
    if (pages && isDisabledPath(path, pages)) {
      setShowContent(false);
      // Extract dynamic path segment names (e.g. [vault], [action]) to exclude them from query
      const dynamicParams = new Set(
        router.pathname.match(/\[(\w+)\]/g)?.map((p) => p.slice(1, -1)) ?? [],
      );
      const query = Object.fromEntries(
        Object.entries(router.query).filter(([key]) => !dynamicParams.has(key)),
      );
      // `/` when stake is enabled, else the first enabled product
      void router
        .push({ pathname: getHomePath(productsUrlState, pages), query })
        .finally(() => setShowContent(true));
    }
  }, [pages, path, router, productsUrlState]);

  const effectDeps = useMemo(() => [pages, path], [pages, path]);

  return (
    <>
      <LayoutEffectSsrDelayed effect={checkPathEffect} deps={effectDeps} />
      {showContent && children}
    </>
  );
};
