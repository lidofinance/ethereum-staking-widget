import { VaultUsdIcon } from 'assets/earn-v2';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { VaultCard } from '../shared/v2/vault-card';
import { EARN_VAULT_USD_SLUG } from '../consts';
import { useUsdVaultApy } from './hooks/use-vault-apy';
import { useUsdVaultStats } from './hooks/use-vault-stats';
import { UsdVaultApyHint } from './components/apy-hint';

export const UsdVaultCard = () => {
  const { apy, isLoading: isApyLoading } = useUsdVaultApy();
  const { totalTvlUsd, isLoading: isTvlLoading } = useUsdVaultStats();

  // TODO: add "position" (token balance)
  return (
    <VaultCard
      title="Lido Earn USD"
      description="Lido Earn USD Vault is curated for USD-denominated assets, designed to target an optimal risk-reward profile without compromising on security, risk controls, or asset quality. It’s built to feel like saving."
      urlSlug={EARN_VAULT_USD_SLUG}
      stats={{
        tvl: totalTvlUsd,
        apx: apy,
        apxLabel: 'APY* (7d avg.)',
        apxHint: <UsdVaultApyHint />,
        isLoading: isApyLoading || isTvlLoading,
      }}
      ctaLabel={'Deposit'}
      variant={'usd'}
      illustration={<VaultUsdIcon />}
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnListEarnUsdDeposit);
      }}
    />
  );
};
