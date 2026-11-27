import { useMemo } from 'react';

import { VaultUsdIcon } from 'assets/earn';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { ApyUpdateTooltipText } from '../shared/apy-update-tooltip-text';
import {
  METAVAULT_ALLOCATION_TOOLTIP,
  MetavaultRiskDisclosure,
  VaultPage,
  getMetavaultStrategyRows,
} from '../shared/vault-page';
import { EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_WITHDRAW_SLUG } from '../consts';

import { UsdVaultPositionManager } from './position-manager/position-manager';
import { EarnUsdFaq } from './faq/faq';
import { useUsdVaultStats } from './hooks/use-vault-stats';
import { useUsdVaultApy } from './hooks/use-vault-apy';
import { useUsdVaultActiveFees } from './hooks/use-active-fees';
import { UsdVaultApyHint } from './components/apy-hint';
import { USD_VAULT_DESCRIPTION, USD_VAULT_TITLE } from './consts';
import { ProtectedTooltip } from './protected-tooltip';

const STRATEGY_LINKS = [
  {
    label: 'View on Etherscan',
    href: 'https://etherscan.io/address/0x4Ce1ac8F43E0E5BD7A346A98aF777bF8fbeA1981',
  },
  {
    label: 'View on Debank',
    href: 'https://debank.com/bundles/221534/accounts',
  },
];

const CHART_MATOMO = {
  clickChartsTvlTab: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceTvlTab,
  clickChartsTvl1m: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceTvl1m,
  clickChartsTvl3m: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceTvl3m,
  clickChartsApyTab: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceApyTab,
  clickChartsApy1m: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceApy1m,
  clickChartsApy3m: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceApy3m,
};

type VaultAction =
  typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;

export const VaultPageUSD = ({ action }: { action: VaultAction }) => {
  const { apy, apyUpdateTimestampMs, isApyStale, isLoading } = useUsdVaultApy();
  const { tvlUsd, isLoading: isTvlLoading } = useUsdVaultStats();
  const { value: fees, isLoading: isFeesLoading } = useUsdVaultActiveFees();

  const strategyInfo = useMemo(
    () => ({
      rows: getMetavaultStrategyRows({ fees, isFeesLoading }),
      links: STRATEGY_LINKS,
    }),
    [fees, isFeesLoading],
  );

  return (
    <VaultPage
      vaultName="usdVault"
      variant="usd"
      title={USD_VAULT_TITLE}
      description={USD_VAULT_DESCRIPTION}
      illustration={<VaultUsdIcon />}
      protectedBadgeTooltip={<ProtectedTooltip />}
      apx={{
        value: apy,
        hint: <UsdVaultApyHint />,
        updateTooltipText: (
          <ApyUpdateTooltipText timestampMs={apyUpdateTimestampMs} />
        ),
        isStale: isApyStale,
        isLoading,
      }}
      tvl={{ value: tvlUsd, isLoading: isTvlLoading }}
      sidePanel={<UsdVaultPositionManager action={action} />}
      strategyInfo={strategyInfo}
      riskDisclosure={
        <MetavaultRiskDisclosure
          vaultTitle={USD_VAULT_TITLE}
          returnsLabel="USD-based"
        />
      }
      allocationTooltip={METAVAULT_ALLOCATION_TOOLTIP}
      faqContent={<EarnUsdFaq />}
      chartMatomo={CHART_MATOMO}
    />
  );
};
