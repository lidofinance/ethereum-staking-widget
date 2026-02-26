import { VaultUsdIcon } from 'assets/earn-v2';

import { VaultCard } from '../shared/v2/vault-card';
import { EARN_VAULT_USD_SLUG } from '../consts';

export const VaultCardUSD = () => {
  const totalTvlUsd = 0;
  const apy = 0;
  const isLoadingTvlUsd = false;
  const isLoadingApy = false;

  return (
    <VaultCard
      title="Lido Earn USD"
      description="Lido Earn USD Vault is curated for USD-denominated assets, designed to target an optimal risk-reward profile without compromising on security, risk controls, or asset quality. It’s built to feel like saving."
      urlSlug={EARN_VAULT_USD_SLUG}
      stats={{
        tvl: totalTvlUsd,
        apx: apy,
        apxLabel: 'APY',
        apxHint: <></>,
        isLoading: isLoadingApy || isLoadingTvlUsd,
      }}
      ctaLabel={'Deposit'}
      variant={'usd'}
      illustration={<VaultUsdIcon />}
      depositLinkCallback={() => {
        // TODO:
        // trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.usdDeposit);
      }}
    />
  );
};
