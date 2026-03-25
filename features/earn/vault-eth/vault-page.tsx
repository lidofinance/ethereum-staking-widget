import { Link } from '@lidofinance/lido-ui';
import type { FC, ReactNode } from 'react';

import { PartnerNethermindIconCircle, VaultEthIcon } from 'assets/earn-v2';
import { PartnerMellowIcon } from 'assets/earn';
import { VaultPage } from 'features/earn/shared/v2/vault-page/vault-page';
import type { InfoItem } from 'features/earn/shared/v2/vault-page/vault-page';
import { Disclaimers } from 'features/earn/shared/v2/disclaimers';
import { VaultAllocation } from 'features/earn/shared/v2/vault-allocation/vault-allocation';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

import { EthVaultPositionManager } from './position-manager/position-manager';
import { EarnEthFaq } from './faq/faq';
import { useEthVaultStats } from './hooks/use-vault-stats';
import { useEthVaultApy } from './hooks/use-vault-apy';
import { EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_WITHDRAW_SLUG } from '../consts';
import { EthVaultApyHint } from './components/apy-hint';
import { ETH_VAULT_DESCRIPTION, ETH_VAULT_TITLE } from './consts';
import { ProtectedTooltip } from './protected-tooltip';

const FEES = [
  { label: 'Performance fee', value: '10%' },
  { label: 'Platform fee', value: '1%' },
];

const GENERAL_INFO_LEFT: InfoItem[] = [
  {
    label: 'Curators',
    value: (
      <>
        <PartnerMellowIcon width={20} height={20} />
        <Link href="https://mellow.finance/">Mellow ↗</Link>
      </>
    ),
  },
  { label: 'Vault contract deployed', value: '02 Feb 2026' },
  {
    label: 'Audit',
    value: (
      <>
        <PartnerNethermindIconCircle width={20} height={20} />
        <Link href="https://2485622279-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FPyujKH9RYkVLASDhGflO%2Fuploads%2F3TMwsLt6Q2z3Wutyewuo%2FNM_0758_Mellow-1.pdf?alt=media&token=187ae9c0-f4fd-44b0-bfd8-d5b003bcd94b">
          Nethermind ↗
        </Link>
      </>
    ),
  },
  { label: 'Last audit date', value: '02 March 2026' },
];

const GENERAL_INFO_RIGHT: Array<{
  label: ReactNode;
  value?: ReactNode;
  tooltip?: string;
}> = [
  {
    label: 'Withdrawal wait time',
    value: 'up to 72 hours',
    tooltip:
      'Withdrawals take up to 72 hours to process. Once ready, your funds can be claimed in the Lido UI',
  },
  {
    label: (
      <Link href="https://etherscan.io/address/0xBBFC8683C8fE8cF73777feDE7ab9574935fea0A4">
        View on Etherscan ↗
      </Link>
    ),
  },
  {
    label: (
      <Link href="https://debank.com/bundles/221533/accounts">
        View on Debank ↗
      </Link>
    ),
  },
];

const RISK_DISCLOSURE = (
  <>
    The EarnETH vault is designed to optimize ETH-based returns by allocating
    capital across a diversified selection of DeFi protocols and strategies
    within the broader ecosystem. The vault provides exposure to multiple DeFi
    positions, each carrying smart contract risk and different levels of market
    and economic risk. Its strategies include liquidity provision, which may
    lead to impermanent loss, and the use of leverage, introducing potential
    liquidation risk. Please note that the vault is not available to U.S.
    persons, U.S. residents, or individuals located in other restricted
    jurisdictions.{' '}
    <Link href="https://lido.fi/earn/risk-disclosures">
      See this for further disclosures
    </Link>
    .
  </>
);

const VAULT_ALLOCATION_FOOTER =
  'Data is provided by Mellow’s API and reflects the most recent snapshot at the time of update. As a result, the TVL shown here may differ from the vault’s TVL due to the data timestamp';

const DATA = {
  title: ETH_VAULT_TITLE,
  description: ETH_VAULT_DESCRIPTION,
  logo: VaultEthIcon,
  fees: FEES,
  generalInfoLeft: GENERAL_INFO_LEFT,
  generalInfoRight: GENERAL_INFO_RIGHT,
  riskDisclosure: RISK_DISCLOSURE,
};

export const EthVaultPage: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const { apy, isLoading: isApyLoading } = useEthVaultApy();
  const {
    totalTvlUsd,
    totalTvlWei,
    isLoading: isTvlLoading,
  } = useEthVaultStats();

  return (
    <>
      <VaultPage
        {...DATA}
        apx={apy}
        tvl={totalTvlUsd}
        isApxLoading={isApyLoading}
        isTvlLoading={isTvlLoading}
        apxHint={<EthVaultApyHint />}
        sidePanel={<EthVaultPositionManager action={action} />}
        collectorTvlWei={totalTvlWei}
        vaultName="ethVault"
        faqContent={<EarnEthFaq />}
        strategyContent={
          <VaultAllocation
            vaultName="ethVault"
            footer={VAULT_ALLOCATION_FOOTER}
          />
        }
        matomo={{
          performanceTabEvent: MATOMO_EARN_EVENTS_TYPES.earnEthPerformance,
          strategyTabEvent: MATOMO_EARN_EVENTS_TYPES.earnEthStrategy,
          faqTabEvent: MATOMO_EARN_EVENTS_TYPES.earnEthFaq,
          clickChartsTvlTab: MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceTvlTab,
          clickChartsTvl1m: MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceTvl1m,
          clickChartsTvl3m: MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceTvl3m,
          clickChartsApyTab: MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceApyTab,
          clickChartsApy1m: MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceApy1m,
          clickChartsApy3m: MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceApy3m,
        }}
        protectedBadgeTooltipText={<ProtectedTooltip />}
      />
      <Disclaimers />
    </>
  );
};
