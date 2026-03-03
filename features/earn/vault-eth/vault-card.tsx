import { VaultEthIcon } from 'assets/earn-v2';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { VaultCard } from '../shared/v2/vault-card';
import { EARN_VAULT_ETH_SLUG } from '../consts';
import { useEthVaultStats } from './hooks/use-vault-stats';
import { useEthVaultApy } from './hooks/use-vault-apy';
import { EthVaultApyHint } from './components/apy-hint';

export const EthVaultCard = () => {
  const { apy, isLoading: isApyLoading } = useEthVaultApy();
  const { totalTvlUsd, isLoading: isTvlLoading } = useEthVaultStats();

  // TODO: add "position" (token balance)
  return (
    <VaultCard
      title="Lido Earn ETH"
      description="Lido Earn ETH vault utilizes tried and tested strategies with premier DeFi protocols for increased rewards on deposits of ETH or stETH."
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
