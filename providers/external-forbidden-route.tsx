import { useCallback, useMemo, ReactNode } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router';

import { useRouterPath } from 'shared/hooks/use-router-path';
import { useConfig } from 'config';
import { isDisabledPath } from 'config/external-config';
import { getHomePath, withProductQuery } from 'config/external-config/products';
import {
  useProductQuery,
  useProductsUrlState,
} from 'config/external-config/use-products-url-state';
import { toSearchParamsInit } from 'utils/to-search-params-init';

import { LayoutEffectSsrDelayed } from 'shared/components/layout-effect-ssr-delayed';

export const ExternalForbiddenRouteProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const path = useRouterPath();
  const { pages } = useConfig().externalConfig;
  const productsUrlState = useProductsUrlState();
  const productQuery = useProductQuery();

  // content admission follows the current path only, never the redirect outcome
  const isDisabled = !!pages && isDisabledPath(path, pages);

  const checkPathEffect = useCallback(() => {
    if (pages && isDisabledPath(path, pages)) {
      // search params exclude route params, so they cannot leak into the redirect
      const query = withProductQuery(
        Object.fromEntries(searchParams),
        productQuery,
      );
      // `/` when stake is enabled, else the first enabled product
      void navigate({
        pathname: getHomePath(productsUrlState, pages),
        search: createSearchParams(toSearchParamsInit(query)).toString(),
      });
    }
  }, [pages, path, navigate, searchParams, productsUrlState, productQuery]);

  const effectDeps = useMemo(() => [pages, path], [pages, path]);

  return (
    <>
      <LayoutEffectSsrDelayed effect={checkPathEffect} deps={effectDeps} />
      {!isDisabled && children}
    </>
  );
};
