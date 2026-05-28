import { VaultStgIcon } from 'assets/earn-v2';
import { useDappStatus } from 'modules/web3';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { useSTGStats } from './hooks/use-stg-stats';
import { useSTGPosition } from './hooks/use-stg-position';
import { LegacyVaultCard } from '../shared/v2/vault-card';
import { EARN_VAULT_STG_SLUG } from '../consts';
import { STG_VAULT_DESCRIPTION, STG_TOKEN_SYMBOL } from './consts';

export const VaultCardSTG = () => {
  const { isWalletConnected } = useDappStatus();
  const { totalTvlUsd, isLoading: isLoadingTvlUsd } = useSTGStats();
  const { strethSharesBalance, isLoading: isLoadingPosition } =
    useSTGPosition();

  return (
    <LegacyVaultCard
      title="Lido stRATEGY"
      description={STG_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_STG_SLUG}
      stats={{
        tvl: totalTvlUsd,
        isLoading: isLoadingTvlUsd,
      }}
      position={
        isWalletConnected
          ? {
              sharesBalance: strethSharesBalance,
              sharesSymbol: STG_TOKEN_SYMBOL,
              isLoading: isLoadingPosition,
            }
          : undefined
      }
      ctaLabel={
        strethSharesBalance && strethSharesBalance > 0n ? 'Manage' : 'View'
      }
      illustration={<VaultStgIcon />}
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyDeposit);
      }}
    />
  );
};
