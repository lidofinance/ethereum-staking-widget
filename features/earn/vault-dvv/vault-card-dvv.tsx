import { VaultDvvIcon } from 'assets/earn';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { useDVVStats } from './hooks/use-dvv-stats';
import { LegacyVaultRow } from '../vaults-list/legacy-vault-row';
import { EARN_VAULT_DVV_SLUG } from '../consts';
import { DVV_VAULT_DESCRIPTION } from './consts';

export const VaultCardDVV = () => {
  const { tvl, isLoading } = useDVVStats();

  return (
    <LegacyVaultRow
      title="Lido DVV"
      description={DVV_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_DVV_SLUG}
      tvl={tvl}
      isLoading={isLoading}
      illustration={<VaultDvvIcon />}
      linkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyDeposit);
      }}
    />
  );
};
