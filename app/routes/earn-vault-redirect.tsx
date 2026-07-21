import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { EARN_PATH } from 'consts/urls';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULTS,
  type EarnVaultKey,
} from 'features/earn/consts';

import NotFoundPage from './not-found';

/**
 * `/earn/:vault` — redirects to the default action
 * (`/earn/:vault/deposit`), preserving the query string. Ported from
 * `pages/earn/[vault]/index.tsx`.
 *
 * The old `getStaticProps` additionally 404'd vaults disabled in the
 * external manifest; that check is runtime-only now and lives in
 * `useEarnVaultGuard` on the target action page.
 */
export default function EarnVaultRedirect() {
  const { vault } = useParams<{ vault: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();

  const isKnownVault =
    !!vault && (EARN_VAULTS as readonly string[]).includes(vault);

  useEffect(() => {
    if (!isKnownVault) return;
    void navigate(
      `${EARN_PATH}/${vault as EarnVaultKey}/${EARN_VAULT_DEPOSIT_SLUG}${search}`,
      { replace: true },
    );
  }, [isKnownVault, vault, search, navigate]);

  if (!isKnownVault) return <NotFoundPage />;
  return null;
}
