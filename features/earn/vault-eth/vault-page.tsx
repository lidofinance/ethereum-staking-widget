import { Link } from '@lidofinance/lido-ui';
import { useMemo, type FC, type ReactNode } from 'react';

import { config } from 'config';
import { PartnerNethermindIconCircle, VaultEthIcon } from 'assets/earn-v2';
import { PartnerMellowIcon } from 'assets/earn';
import { VaultPage } from 'features/earn/shared/v2/vault-page/vault-page';
import type { InfoItem } from 'features/earn/shared/v2/vault-page/vault-page';
import { Disclaimers } from 'features/earn/shared/v2/disclaimers';
import { VaultAllocation } from 'features/earn/shared/v2/vault-allocation/vault-allocation';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import {
  ACTIVE_FEES_TOOLTIP,
  WITHDRAWAL_WAITING_TIME_TOOLTIP,
} from 'modules/mellow-meta-vaults';

import { DrawerRight } from '../shared/drawer-right';
import { ApyUpdateTooltipText } from '../shared/v2/apy-update-tooltip-text';
import { ActiveFeesValue } from '../shared/v2/active-fees-value';

import { EthVaultPositionManager } from './position-manager/position-manager';
import { EarnEthFaq } from './faq/faq';
import { useEthVaultStats } from './hooks/use-vault-stats';
import { useEthVaultApy } from './hooks/use-vault-apy';
import { useEthVaultPosition } from './hooks/use-position';
import { useEthVaultActiveFees } from './hooks/use-active-fees';
import { EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_WITHDRAW_SLUG } from '../consts';
import { EthVaultApyHint } from './components/apy-hint';
import {
  ETH_VAULT_DESCRIPTION,
  ETH_VAULT_TITLE,
  ETH_VAULT_TOKEN_SYMBOL,
} from './consts';
import { ProtectedTooltip } from './protected-tooltip';
import { EthVaultDrawerProvider, useEthVaultDrawer } from './drawer-context';

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
    value: 'Instant or up to 72 hours',
    tooltip: WITHDRAWAL_WAITING_TIME_TOOLTIP,
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
    within the broader ecosystem.
    <br />
    The vault provides exposure to multiple DeFi positions, each carrying smart
    contract risk and different levels of market and economic risk. Its
    strategies include liquidity provision, which may lead to impermanent loss,
    and the use of leverage, introducing potential liquidation risk. Please note
    that the vault is not available to U.S. persons, U.S. residents, or
    individuals located in other restricted jurisdictions.{' '}
    <Link href={`${config.rootOrigin}/earn/risk-disclosures`}>
      See this for further disclosures
    </Link>
    .
    <br />
    <br />
    Lido EarnETH relies on third-party infrastructure provided by Mellow. By
    proceeding, you are subject to Mellow&apos;s{' '}
    <Link href="https://mellow.finance/Runtime-Labs-Vault-Legal-Notice.pdf">
      Terms of Service
    </Link>{' '}
    and{' '}
    <Link href="https://mellow.finance/Mellow-Privacy-Notice.pdf">
      Privacy Notice
    </Link>
    .
    <br />
    <br />
    By depositing cryptoassets into the Lido EarnETH vault you:
    <br />- acknowledge and accept Mellow&apos;s{' '}
    <Link href="https://mellow.finance/Runtime-Labs-Vault-Legal-Notice.pdf">
      Terms of Use
    </Link>{' '}
    and{' '}
    <Link href="https://mellow.finance/Mellow-Privacy-Notice.pdf">
      Privacy Notice
    </Link>
    ,{' '}
    <Link href={`${config.rootOrigin}/terms-of-use`}>
      Lido&apos;s Terms of Use
    </Link>{' '}
    and the{' '}
    <Link href={`${config.rootOrigin}/earn/risk-disclosures`}>
      Risk Disclosures
    </Link>
    .
    <br />- acknowledge and agree that the Lido EarnETH vault relies on
    third-party infrastructure provided by Mellow (&quot;Third-Party
    Services&quot;) and that : (a) the operation, performance, security,
    legality, or continued availability of any such Third-Party Services cannot
    be guaranteed; (b) any integration, routing, or utilisation of cryptoassets
    through such Third-Party Services may result in partial or total loss,
    inaccessibility, or impairment of cryptoassets, whether due to malfunction,
    insolvency, security breach, exploit, hack, de-peg, or other technical or
    operational failure; and (&zwnj;c) you assume all such risks fully and
    voluntarily. By using or interacting with the vault, you acknowledge that
    the blockchain and DeFi ecosystems are experimental and inherently risky,
    and you accept and assume all risks associated with the use of any
    Third-Party Services, integrations, or protocols, entirely at your own
    discretion and responsibility.
  </>
);

const VAULT_ALLOCATION_FOOTER =
  'Data is provided by Mellow’s API and reflects the most recent snapshot at the time of update. As a result, the TVL shown here may differ from the vault’s TVL due to the data timestamp';

const DATA = {
  title: ETH_VAULT_TITLE,
  description: ETH_VAULT_DESCRIPTION,
  logo: VaultEthIcon,
  generalInfoLeft: GENERAL_INFO_LEFT,
  generalInfoRight: GENERAL_INFO_RIGHT,
  riskDisclosure: RISK_DISCLOSURE,
};

const EthVaultPageContent: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const { isDrawerOpen, closeDrawer, shouldHideUpgradeNowButton } =
    useEthVaultDrawer();
  const {
    apy,
    apyUpdateTimestampMs,
    isApyStale,
    isLoading: isApyLoading,
  } = useEthVaultApy();
  const { tvlUsd, isLoading: isTvlLoading } = useEthVaultStats();
  const {
    data: earnethPositionData,
    isLoading: isPositionLoading,
    ethAmount,
    usdBalance,
  } = useEthVaultPosition();
  const { value: activeFeesValue, isLoading: isActiveFeesLoading } =
    useEthVaultActiveFees();

  const sharesBalance = earnethPositionData?.earnethSharesBalance;

  const fees = useMemo<InfoItem[]>(
    () => [
      {
        label: 'Active fees',
        value: (
          <ActiveFeesValue
            value={activeFeesValue}
            isLoading={isActiveFeesLoading}
          />
        ),
        tooltip: ACTIVE_FEES_TOOLTIP,
      },
    ],
    [activeFeesValue, isActiveFeesLoading],
  );

  return (
    <>
      <VaultPage
        {...DATA}
        fees={fees}
        apx={apy}
        tvlUsd={tvlUsd}
        isApxLoading={isApyLoading}
        isTvlLoading={isTvlLoading}
        apxHint={<EthVaultApyHint />}
        apxUpdateTooltipText={
          <ApyUpdateTooltipText timestampMs={apyUpdateTimestampMs} />
        }
        isApxStale={isApyStale}
        sidePanel={<EthVaultPositionManager action={action} />}
        vaultName="ethVault"
        balance={
          sharesBalance
            ? {
                amount: ethAmount,
                symbol: TOKEN_SYMBOLS.eth,
                sharesAmount: sharesBalance,
                sharesSymbol: ETH_VAULT_TOKEN_SYMBOL,
                usdAmount: usdBalance,
                isLoading: isPositionLoading,
              }
            : undefined
        }
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
      <DrawerRight
        onClose={closeDrawer}
        isOpen={isDrawerOpen}
        shouldHideUpgradeNowButton={shouldHideUpgradeNowButton}
      />
      <Disclaimers />
    </>
  );
};

export const EthVaultPage: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  return (
    <EthVaultDrawerProvider>
      <EthVaultPageContent action={action} />
    </EthVaultDrawerProvider>
  );
};
