import { useParams } from 'react-router';
import Head from 'next/head';

import { Layout } from 'shared/components';
import { VaultPageDVV, VaultPageGGV, VaultPageSTG } from 'features/earn';
import {
  type EarnVaultKey,
  EARN_VAULTS,
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from 'features/earn/consts';
import { EthVaultPage } from 'features/earn/vault-eth';
import { VaultPageUSD } from 'features/earn/vault-usd';
import { isV1DesignVault } from 'features/earn/shared/utils/isV1DesignVault';
import { useEarnVaultGuard } from 'features/earn/shared/hooks/use-earn-vault-guard';

import NotFoundPage from './not-found';

const VAULT_PAGES = {
  eth: EthVaultPage,
  usd: VaultPageUSD,
  ggv: VaultPageGGV,
  dvv: VaultPageDVV,
  strategy: VaultPageSTG,
} as const;

type EarnVaultAction =
  typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;

/**
 * `/earn/:vault/:action` — ported from `pages/earn/[vault]/[action].tsx`.
 * Unknown vault/action render the 404 page (was a `getStaticPaths`
 * whitelist); manifest-driven vault gating stays in `useEarnVaultGuard`.
 */
const VaultActionPage = ({
  vault,
  action,
}: {
  vault: EarnVaultKey;
  action: EarnVaultAction;
}) => {
  useEarnVaultGuard(vault);
  const VaultPage = VAULT_PAGES[vault];
  const vaultTitle = vault.toUpperCase();

  // undefined means default container size ('tight' at the moment)
  const containerSize = isV1DesignVault(vault) ? undefined : 'full';

  return (
    <Layout containerSize={containerSize}>
      <Head>
        <title>{`${vaultTitle} ${action} | Earn | Lido`}</title>
        <meta
          name="description"
          content={`${vaultTitle} vault ${action} on Lido`}
        />
      </Head>

      <VaultPage action={action} />
    </Layout>
  );
};

export default function EarnVaultActionRoute() {
  const { vault, action } = useParams<{ vault: string; action: string }>();

  if (
    !vault ||
    !(EARN_VAULTS as readonly string[]).includes(vault) ||
    (action !== EARN_VAULT_DEPOSIT_SLUG && action !== EARN_VAULT_WITHDRAW_SLUG)
  ) {
    return <NotFoundPage />;
  }

  return <VaultActionPage vault={vault as EarnVaultKey} action={action} />;
}
