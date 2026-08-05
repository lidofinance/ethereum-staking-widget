import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { EARN_PATH } from 'consts/urls';
import { useEarnState } from './use-earn-state';

/**
 * Redirects to /earn if the given vault is disabled (by URL params or config).
 * Preserves search params only (route params must not leak into the query).
 *
 * Should be called from vault pages to handle PARTIAL earn state,
 * where individual vaults are disabled but earn itself is still accessible.
 */
export const useEarnVaultGuard = (vaultName: string) => {
  const router = useRouter();
  const { isVaultDisabled } = useEarnState();

  useEffect(() => {
    if (!router.isReady || !isVaultDisabled(vaultName)) return;

    void router.push({ pathname: EARN_PATH, query: router.searchQuery });
  }, [isVaultDisabled, vaultName, router, router.isReady]);
};
