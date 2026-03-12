import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { EARN_PATH } from 'consts/urls';
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

  useEffect(() => {
    if (!router.isReady || !isVaultDisabled(vaultName)) return;

    const dynamicParams = new Set(
      router.pathname.match(/\[(\w+)\]/g)?.map((p) => p.slice(1, -1)) ?? [],
    );
    const query = Object.fromEntries(
      Object.entries(router.query).filter(([key]) => !dynamicParams.has(key)),
    );

    void router.push({ pathname: EARN_PATH, query });
  }, [isVaultDisabled, vaultName, router, router.isReady]);
};
