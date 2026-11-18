import { useCallback, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/router';

import { useRouterPath } from 'shared/hooks/use-router-path';
import { useConfig } from 'config';
import { isDisabledPath } from 'config/external-config';
import { getHomePath, getRedirectQuery } from 'config/external-config/products';
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
  const router = useRouter();
  const path = useRouterPath();
  const { pages } = useConfig().externalConfig;
  const productsUrlState = useProductsUrlState();
  const productQuery = useProductQuery();

  // content admission follows the current path only, never the redirect outcome
  const isDisabled = !!pages && isDisabledPath(path, pages);

  const checkPathEffect = useCallback(() => {
    if (pages && isDisabledPath(path, pages)) {
      const query = getRedirectQuery(
        router.pathname,
        router.query,
        productQuery,
      );
      // `/` when stake is enabled, else the first enabled product
      void router.push({
        pathname: getHomePath(productsUrlState, pages),
        query,
      });
    }
  }, [pages, path, router, productsUrlState, productQuery]);

  const effectDeps = useMemo(() => [pages, path], [pages, path]);

  return (
    <>
      <LayoutEffectSsrDelayed
        effect={checkPathEffect}
        deps={effectDeps}
        // NextJS router is not guaranteed to be isReady:true on the first render
        // and this will cause query params to be empty
        waitForNextRouter
      />
      {!isDisabled && children}
    </>
  );
};
