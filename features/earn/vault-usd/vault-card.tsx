import { VaultUsdIcon } from 'assets/earn-v2';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { VaultCard } from '../shared/v2/vault-card';
import { EARN_VAULT_USD_SLUG } from '../consts';
import { useUsdVaultApy } from './hooks/use-vault-apy';
import { useUsdVaultStats } from './hooks/use-vault-stats';
import { UsdVaultApyHint } from './components/apy-hint';
import { USD_VAULT_DESCRIPTION, USD_VAULT_TITLE } from './consts';

export const UsdVaultCard = () => {
  const { apy, isLoading: isApyLoading } = useUsdVaultApy();
  const { totalTvlUsd, isLoading: isTvlLoading } = useUsdVaultStats();

  // TODO: add "position" (token balance)
  return (
    <VaultCard
      title={USD_VAULT_TITLE}
      description={USD_VAULT_DESCRIPTION}
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
