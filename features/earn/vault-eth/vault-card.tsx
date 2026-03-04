import { VaultEthIcon } from 'assets/earn-v2';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { VaultCard } from '../shared/v2/vault-card';
import { EARN_VAULT_ETH_SLUG } from '../consts';
import { useEthVaultStats } from './hooks/use-vault-stats';
import { useEthVaultApy } from './hooks/use-vault-apy';
import { EthVaultApyHint } from './components/apy-hint';
import { ETH_VAULT_DESCRIPTION, ETH_VAULT_TITLE } from './consts';

export const EthVaultCard = () => {
  const { apy, isLoading: isApyLoading } = useEthVaultApy();
  const { totalTvlUsd, isLoading: isTvlLoading } = useEthVaultStats();

  // TODO: add "position" (token balance)
  return (
    <VaultCard
      title={ETH_VAULT_TITLE}
      description={ETH_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_ETH_SLUG}
      stats={{
        tvl: totalTvlUsd,
        apx: apy,
        apxLabel: 'APY* (7d avg.)',
        apxHint: <EthVaultApyHint />,
        isLoading: isApyLoading || isTvlLoading,
      }}
      ctaLabel={'Deposit'}
      variant={'eth'}
      illustration={<VaultEthIcon />}
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnListEarnEthDeposit);
      }}
    />
  );
};
