import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { EARN_PATH } from 'consts/urls';
import { getRedirectQuery } from 'config/external-config/products';
import { useProductQuery } from 'config/external-config/use-products-url-state';
import { useEarnState } from './use-earn-state';

/**
 * Redirects to /earn if the given vault is disabled (by URL params or config).
 * Preserves all query parameters except dynamic path segments.
 *
 * Should be called from vault pages to handle PARTIAL earn state,
 * where individual vaults are disabled but earn itself is still accessible.
 */
export const useEarnVaultGuard = (vaultName: string) => {
  const router = useRouter();
  const { isVaultDisabled } = useEarnState();
  const productQuery = useProductQuery();

  useEffect(() => {
    if (!router.isReady || !isVaultDisabled(vaultName)) return;

    const query = getRedirectQuery(router.pathname, router.query, productQuery);

    void router.push({ pathname: EARN_PATH, query });
  }, [isVaultDisabled, vaultName, router, router.isReady, productQuery]);
};
