import { VaultEthIcon } from 'assets/earn-v2';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { VaultCard } from '../shared/v2/vault-card';
import { EARN_VAULT_ETH_SLUG } from '../consts';
import { useEthVaultStats } from './hooks/use-vault-stats';
import { useEthVaultApy } from './hooks/use-vault-apy';
import { EthVaultApyHint } from './components/apy-hint';
import {
  ETH_VAULT_DESCRIPTION,
  ETH_VAULT_TITLE,
  ETH_VAULT_TOKEN_SYMBOL,
} from './consts';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { useEthVaultPosition } from './hooks/use-position';
import { ProtectedTooltip } from './protected-tooltip';

export const EthVaultCard = () => {
  const { apy, isLoading: isApyLoading } = useEthVaultApy();
  const { tvlUsd, isLoading: isTvlLoading } = useEthVaultStats();

  const {
    data: earnethPositionData,
    isLoading: isPositionLoading,
    ethAmount,
    usdBalance,
  } = useEthVaultPosition();

  const sharesBalance = earnethPositionData?.earnethSharesBalance;

  return (
    <VaultCard
      title={ETH_VAULT_TITLE}
      description={ETH_VAULT_DESCRIPTION}
      urlSlug={EARN_VAULT_ETH_SLUG}
      stats={{
        tvl: tvlUsd,
        apx: apy,
        apxLabel: 'APY* (7d avg.)',
        apxHint: <EthVaultApyHint />,
        isLoading: isApyLoading || isTvlLoading,
      }}
      position={{
        sharesBalance,
        sharesSymbol: ETH_VAULT_TOKEN_SYMBOL,
        baseAmount: ethAmount,
        baseSymbol: TOKEN_SYMBOLS.eth,
        usdAmount: sharesBalance ? usdBalance : undefined,
        isLoading: isPositionLoading,
      }}
      ctaLabel={sharesBalance && sharesBalance > 0n ? 'Manage' : 'Deposit'}
      variant={'eth'}
      illustration={<VaultEthIcon />}
      depositLinkCallback={() => {
        trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnListEarnEthDeposit);
      }}
      protectedBadgeTooltipText={<ProtectedTooltip />}
    />
  );
};
