import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isVaultDisabled } = useEarnState();

  useEffect(() => {
    if (!isVaultDisabled(vaultName)) return;

    void navigate({ pathname: EARN_PATH, search: searchParams.toString() });
  }, [isVaultDisabled, vaultName, navigate, searchParams]);
};
