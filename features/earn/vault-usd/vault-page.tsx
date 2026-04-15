import type { FC, ReactNode } from 'react';
import { Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { PartnerNethermindIconCircle, VaultUsdIcon } from 'assets/earn-v2';
import { PartnerMellowIcon } from 'assets/earn';
import { VaultPage } from 'features/earn/shared/v2/vault-page/vault-page';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';

import { VaultAllocation } from '../shared/v2/vault-allocation/vault-allocation';

import { UsdVaultPositionManager } from './position-manager/position-manager';
import { EarnUsdFaq } from './faq/faq';
import { EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_WITHDRAW_SLUG } from '../consts';
import { useUsdVaultStats } from './hooks/use-vault-stats';
import { useUsdVaultApy } from './hooks/use-vault-apy';
import { Disclaimers } from '../shared/v2/disclaimers';
import { UsdVaultApyHint } from './components/apy-hint';
import { USD_VAULT_DESCRIPTION, USD_VAULT_TITLE } from './consts';
import { ProtectedTooltip } from './protected-tooltip';

const FEES = [
  { label: 'Performance fee', value: '10%' },
  { label: 'Platform fee', value: '1%' },
];

const GENERAL_INFO_LEFT = [
  {
    label: 'Curators',
    value: (
      <>
        <PartnerMellowIcon width={20} height={20} />{' '}
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
      <Link href="https://etherscan.io/address/0x4Ce1ac8F43E0E5BD7A346A98aF777bF8fbeA1981">
        View on Etherscan ↗
      </Link>
    ),
  },
  {
    label: (
      <Link href="https://debank.com/bundles/221534/accounts">
        View on Debank ↗
      </Link>
    ),
  },
];

const RISK_DISCLOSURE = (
  <>
    <p>
      The EarnUSD vault is designed to optimize USD-based returns by allocating
      capital across a diversified selection of DeFi protocols and strategies
      within the broader ecosystem.
      <br />
      The vault provides exposure to multiple DeFi positions, each carrying
      smart contract risk and different levels of market and economic risk. Its
      strategies include liquidity provision, which may lead to impermanent
      loss, and the use of leverage, introducing potential liquidation risk.
      Please note that the vault is not available to U.S. persons, U.S.
      residents, or individuals located in other restricted jurisdictions.{' '}
      <Link href={`${config.rootOrigin}/earn/risk-disclosures`}>
        See this for further disclosures
      </Link>
      .
    </p>
    <br />
    <p>
      Lido EarnUSD relies on third-party infrastructure provided by Mellow. By
      proceeding, you are subject to Mellow&apos;s{' '}
      <Link href="https://mellow.finance/Runtime-Labs-Vault-Legal-Notice.pdf">
        Terms of Service
      </Link>{' '}
      and{' '}
      <Link href="https://mellow.finance/Mellow-Privacy-Notice.pdf">
        Privacy Notice
      </Link>
      .
    </p>
    <br />
    <p>
      By depositing cryptoassets into the Lido EarnUSD vault you:
      <br />- acknowledge and accept Mellow&apos;s{' '}
      <Link href="https://mellow.finance/Runtime-Labs-Vault-Legal-Notice.pdf">
        Terms of Use
      </Link>{' '}
      and{' '}
      <Link href="https://mellow.finance/Mellow-Privacy-Notice.pdf">
        Privacy Notice
      </Link>
      ,{' '}
      <Link href={`${config.rootOrigin}/privacy-notice`}>
        Lido&apos;s Terms of Use
      </Link>{' '}
      and the{' '}
      <Link href={`${config.rootOrigin}/earn/risk-disclosures`}>Risk Disclosures</Link>
      .
      <br />- acknowledge and agree that the Lido EarnUSD vault relies on
      third-party infrastructure provided by Mellow (&quot;Third-Party
      Services&quot;) and that : (a) the operation, performance, security,
      legality, or continued availability of any such Third-Party Services
      cannot be guaranteed; (b) any integration, routing, or utilisation of
      cryptoassets through such Third-Party Services may result in partial or
      total loss, inaccessibility, or impairment of cryptoassets, whether due to
      malfunction, insolvency, security breach, exploit, hack, de-peg, or other
      technical or operational failure; and (c) you assume all such risks fully
      and voluntarily. By using or interacting with the vault, you acknowledge
      that the blockchain and DeFi ecosystems are experimental and inherently
      risky, and you accept and assume all risks associated with the use of any
      Third-Party Services, integrations, or protocols, entirely at your own
      discretion and responsibility.
    </p>
  </>
);

const VAULT_ALLOCATION_FOOTER =
  'Data is provided by Mellow’s API and reflects the most recent snapshot at the time of update. As a result, the TVL shown here may differ from the vault’s TVL due to the data timestamp';

const DATA = {
  title: USD_VAULT_TITLE,
  description: USD_VAULT_DESCRIPTION,
  logo: VaultUsdIcon,
  fees: FEES,
  generalInfoLeft: GENERAL_INFO_LEFT,
  generalInfoRight: GENERAL_INFO_RIGHT,
  riskDisclosure: RISK_DISCLOSURE,
} as const;

export const VaultPageUSD: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const { apy, isLoading: isApyLoading } = useUsdVaultApy();
  const { tvlUsd, isLoading: isTvlLoading } = useUsdVaultStats();

  return (
    <>
      <VaultPage
        {...DATA}
        apx={apy}
        tvlUsd={tvlUsd}
        isApxLoading={isApyLoading}
        isTvlLoading={isTvlLoading}
        apxHint={<UsdVaultApyHint />}
        sidePanel={<UsdVaultPositionManager action={action} />}
        vaultName="usdVault"
        faqContent={<EarnUsdFaq />}
        strategyContent={
          <VaultAllocation
            vaultName="usdVault"
            footer={VAULT_ALLOCATION_FOOTER}
          />
        }
        matomo={{
          performanceTabEvent: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformance,
          strategyTabEvent: MATOMO_EARN_EVENTS_TYPES.earnUsdStrategy,
          faqTabEvent: MATOMO_EARN_EVENTS_TYPES.earnUsdFaq,
          clickChartsTvlTab: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceTvlTab,
          clickChartsTvl1m: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceTvl1m,
          clickChartsTvl3m: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceTvl3m,
          clickChartsApyTab: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceApyTab,
          clickChartsApy1m: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceApy1m,
          clickChartsApy3m: MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceApy3m,
        }}
        protectedBadgeTooltipText={<ProtectedTooltip />}
      />
      <Disclaimers />
    </>
  );
};
