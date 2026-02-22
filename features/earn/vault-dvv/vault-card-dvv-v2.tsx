import { VaultDvvIcon } from 'assets/earn-v2';
import { useDappStatus } from 'modules/web3';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { useDVVStats } from './hooks/use-dvv-stats';
import { useDVVPosition } from './hooks/use-dvv-position';
import { VaultCard } from '../shared/v2/vault-card';
import { EARN_VAULT_DVV_SLUG } from '../consts';
import { DVV_TOKEN_SYMBOL, DVV_VAULT_DESCRIPTION } from './consts';

export const VaultCardDVV = () => {
  const { isWalletConnected } = useDappStatus();
  const { tvl, apr, isLoading: isLoadingStats } = useDVVStats();
  const { sharesBalance, isLoading: isLoadingPosition } = useDVVPosition();

  return (
    <VaultCard
      title="Lido DVV"
      description={DVV_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_DVV_SLUG}
      stats={{
        tvl: tvl,
        apx: apr,
        apxLabel: 'APR',
        apxHint: <></>,
        isLoading: isLoadingStats,
      }}
      position={
        isWalletConnected
          ? {
              balance: sharesBalance,
              symbol: DVV_TOKEN_SYMBOL,
              isLoading: isLoadingPosition,
            }
          : undefined
      }
      ctaLabel={'Upgrade your assets'}
      illustration={<VaultDvvIcon />}
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyDeposit);
      }}
    />
  );
};
