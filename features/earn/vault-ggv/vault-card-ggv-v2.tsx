import { VaultGgvIcon } from 'assets/earn-v2';
import { useDappStatus } from 'modules/web3';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { LegacyVaultCard } from '../shared/v2/vault-card';
import { EARN_VAULT_GGV_SLUG } from '../consts';
import { GGV_VAULT_DESCRIPTION, GGV_TOKEN_SYMBOL } from './consts';
import { useGGVStats } from './hooks/use-ggv-stats';
import { useGGVPosition } from './hooks/use-ggv-position';

export const VaultCardGGV = () => {
  const { isWalletConnected } = useDappStatus();
  const { tvl, isLoading: isLoadingStats } = useGGVStats();
  const { sharesBalance, isLoading: isLoadingPosition } = useGGVPosition();

  return (
    <LegacyVaultCard
      title="Lido GGV"
      description={GGV_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_GGV_SLUG}
      stats={{
        tvl: tvl,
        isLoading: isLoadingStats,
      }}
      position={
        isWalletConnected
          ? {
              sharesBalance: sharesBalance,
              sharesSymbol: GGV_TOKEN_SYMBOL,
              isLoading: isLoadingPosition,
            }
          : undefined
      }
      ctaLabel={sharesBalance && sharesBalance > 0n ? 'Manage' : 'View'}
      illustration={<VaultGgvIcon />}
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyDeposit);
      }}
    />
  );
};
