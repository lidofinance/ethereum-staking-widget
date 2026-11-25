import { VaultGgvIcon } from 'assets/earn-v2';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { LegacyVaultRow } from '../vaults-list/legacy-vault-row';
import { EARN_VAULT_GGV_SLUG } from '../consts';
import { GGV_VAULT_DESCRIPTION } from './consts';
import { useGGVStats } from './hooks/use-ggv-stats';

export const VaultCardGGV = () => {
  const { tvl, isLoading } = useGGVStats();

  return (
    <LegacyVaultRow
      title="Lido GGV"
      description={GGV_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_GGV_SLUG}
      tvl={tvl}
      isLoading={isLoading}
      illustration={<VaultGgvIcon />}
      // EarnETH does not accept GG now
      isUpgradable={false}
      linkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyDeposit);
      }}
    />
  );
};
