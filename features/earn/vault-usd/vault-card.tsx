import { VaultUsdIcon } from 'assets/earn-v2';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { VaultCard } from '../shared/v2/vault-card';
import { EARN_VAULT_USD_SLUG } from '../consts';
import { useUsdVaultApy } from './hooks/use-vault-apy';
import { useUsdVaultStats } from './hooks/use-vault-stats';
import { UsdVaultApyHint } from './components/apy-hint';
import {
  USD_VAULT_DESCRIPTION,
  USD_VAULT_TITLE,
  USD_VAULT_TOKEN_SYMBOL,
} from './consts';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { useUsdVaultPosition } from './hooks/use-position';
import { ProtectedTooltip } from './protected-tooltip';

export const UsdVaultCard = () => {
  const { apy, isLoading: isApyLoading } = useUsdVaultApy();
  const { tvlUsd, isLoading: isTvlLoading } = useUsdVaultStats();
  const {
    data: usdPositionData,
    isLoading: isPositionLoading,
    usdcAmount,
  } = useUsdVaultPosition();

  const sharesBalance = usdPositionData?.earnusdSharesBalance;

  return (
    <VaultCard
      title={USD_VAULT_TITLE}
      description={USD_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_USD_SLUG}
      stats={{
        tvl: tvlUsd,
        apx: apy,
        apxLabel: 'APY* (7d avg.)',
        apxHint: <UsdVaultApyHint />,
        isLoading: isApyLoading || isTvlLoading,
      }}
      position={{
        sharesBalance,
        sharesSymbol: USD_VAULT_TOKEN_SYMBOL,
        baseAmount: usdcAmount,
        baseSymbol: TOKEN_SYMBOLS.usdc,
        isLoading: isPositionLoading,
      }}
      ctaLabel={sharesBalance && sharesBalance > 0n ? 'Manage' : 'Deposit'}
      variant={'usd'}
      illustration={<VaultUsdIcon />}
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnListEarnUsdDeposit);
      }}
      protectedBadgeTooltipText={<ProtectedTooltip />}
    />
  );
};
