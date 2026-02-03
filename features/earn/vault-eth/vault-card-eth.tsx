import { VaultEthIcon } from 'assets/earn-v2';
import { VaultCard } from '../shared/vault-card-v2';
import { EARN_VAULT_ETH_SLUG } from '../consts';

export const VaultCardETH = () => {
  const totalTvlUsd = 0;
  const apy = 0;
  const isLoadingTvlUsd = false;
  const isLoadingApy = false;

  return (
    <VaultCard
      title="Lido Earn ETH"
      description="Lido Earn ETH vault utilizes tried and tested strategies with premier DeFi protocols for increased rewards on deposits of ETH or stETH."
      urlSlug={EARN_VAULT_ETH_SLUG}
      stats={{
        tvl: totalTvlUsd,
        apx: apy,
        apxLabel: 'APY',
        apxHint: <></>,
        isLoading: isLoadingApy || isLoadingTvlUsd,
      }}
      ctaLabel={'Deposit'}
      variant={'eth'}
      illustration={<VaultEthIcon />}
      depositLinkCallback={() => {
        // TODO:
        // trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ethDeposit);
      }}
    />
  );
};
