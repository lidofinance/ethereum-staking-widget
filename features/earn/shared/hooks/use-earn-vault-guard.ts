import { useEffect } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router';
import { EARN_PATH } from 'consts/urls';
import { withProductQuery } from 'config/external-config/products';
import { toSearchParamsInit } from 'utils/to-search-params-init';
import { useProductQuery } from 'config/external-config/use-products-url-state';
import { useEarnState } from './use-earn-state';

/**
 * Redirects to /earn if the given vault is disabled (by URL params or config).
 * Preserves search params only (route params must not leak into the query).
 *
 * Should be called from vault pages to handle PARTIAL earn state,
 * where individual vaults are disabled but earn itself is still accessible.
 */
export const useEarnVaultGuard = (vaultName: string) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isVaultDisabled } = useEarnState();
  const productQuery = useProductQuery();

  useEffect(() => {
    if (!isVaultDisabled(vaultName)) return;

    const query = withProductQuery(
      Object.fromEntries(searchParams),
      productQuery,
    );

    void navigate({
      pathname: EARN_PATH,
      search: createSearchParams(toSearchParamsInit(query)).toString(),
    });
  }, [isVaultDisabled, vaultName, navigate, searchParams, productQuery]);
};
