import { VaultStgIcon } from 'assets/earn-v2';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { useSTGStats } from './hooks/use-stg-stats';
import { LegacyVaultRow } from '../vaults-list/legacy-vault-row';
import { EARN_VAULT_STG_SLUG } from '../consts';
import { STG_VAULT_DESCRIPTION } from './consts';

export const VaultCardSTG = () => {
  const { totalTvlUsd, isLoading } = useSTGStats();

  return (
    <LegacyVaultRow
      title="Lido stRATEGY"
      description={STG_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_STG_SLUG}
      tvl={totalTvlUsd}
      isLoading={isLoading}
      illustration={<VaultStgIcon />}
      linkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyDeposit);
      }}
    />
  );
};
