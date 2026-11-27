import { useMemo } from 'react';

import { VaultEthIcon } from 'assets/earn';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

import { DrawerRight } from '../shared/drawer-right';
import { ApyUpdateTooltipText } from '../shared/apy-update-tooltip-text';
import {
  METAVAULT_ALLOCATION_TOOLTIP,
  MetavaultRiskDisclosure,
  VaultPage,
  getMetavaultStrategyRows,
} from '../shared/vault-page';
import { EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_WITHDRAW_SLUG } from '../consts';

import { EthVaultPositionManager } from './position-manager/position-manager';
import { EarnEthFaq } from './faq/faq';
import { useEthVaultStats } from './hooks/use-vault-stats';
import { useEthVaultApy } from './hooks/use-vault-apy';
import { useEthVaultActiveFees } from './hooks/use-active-fees';
import { EthVaultApyHint } from './components/apy-hint';
import { ETH_VAULT_DESCRIPTION, ETH_VAULT_TITLE } from './consts';
import { ProtectedTooltip } from './protected-tooltip';
import { EthVaultDrawerProvider, useEthVaultDrawer } from './drawer-context';

const STRATEGY_LINKS = [
  {
    label: 'View on Etherscan',
    href: 'https://etherscan.io/address/0xBBFC8683C8fE8cF73777feDE7ab9574935fea0A4',
  },
  {
    label: 'View on Debank',
    href: 'https://debank.com/bundles/221533/accounts',
  },
];

const CHART_MATOMO = {
  clickChartsTvlTab: MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceTvlTab,
  clickChartsTvl1m: MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceTvl1m,
  clickChartsTvl3m: MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceTvl3m,
  clickChartsApyTab: MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceApyTab,
  clickChartsApy1m: MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceApy1m,
  clickChartsApy3m: MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceApy3m,
};

type VaultAction =
  typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;

const EthVaultPageContent = ({ action }: { action: VaultAction }) => {
  const { isDrawerOpen, closeDrawer, shouldHideUpgradeNowButton } =
    useEthVaultDrawer();
  const { apy, apyUpdateTimestampMs, isApyStale, isLoading } = useEthVaultApy();
  const { tvlUsd, isLoading: isTvlLoading } = useEthVaultStats();
  const { value: fees, isLoading: isFeesLoading } = useEthVaultActiveFees();

  const strategyInfo = useMemo(
    () => ({
      rows: getMetavaultStrategyRows({ fees, isFeesLoading }),
      links: STRATEGY_LINKS,
    }),
    [fees, isFeesLoading],
  );

  return (
    <>
      <VaultPage
        vaultName="ethVault"
        variant="eth"
        title={ETH_VAULT_TITLE}
        description={ETH_VAULT_DESCRIPTION}
        illustration={<VaultEthIcon />}
        protectedBadgeTooltip={<ProtectedTooltip />}
        apx={{
          value: apy,
          hint: <EthVaultApyHint />,
          updateTooltipText: (
            <ApyUpdateTooltipText timestampMs={apyUpdateTimestampMs} />
          ),
          isStale: isApyStale,
          isLoading,
        }}
        tvl={{ value: tvlUsd, isLoading: isTvlLoading }}
        sidePanel={<EthVaultPositionManager action={action} />}
        strategyInfo={strategyInfo}
        riskDisclosure={
          <MetavaultRiskDisclosure
            vaultTitle={ETH_VAULT_TITLE}
            returnsLabel="ETH-based"
          />
        }
        allocationTooltip={METAVAULT_ALLOCATION_TOOLTIP}
        faqContent={<EarnEthFaq />}
        chartMatomo={CHART_MATOMO}
      />
      <DrawerRight
        onClose={closeDrawer}
        isOpen={isDrawerOpen}
        shouldHideUpgradeNowButton={shouldHideUpgradeNowButton}
      />
    </>
  );
};

export const EthVaultPage = ({ action }: { action: VaultAction }) => (
  <EthVaultDrawerProvider>
    <EthVaultPageContent action={action} />
  </EthVaultDrawerProvider>
);
