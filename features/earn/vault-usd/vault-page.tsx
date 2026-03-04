import type { FC, ReactNode } from 'react';
import { Link } from '@lidofinance/lido-ui';

import {
  PartnerNethermindIconCircle,
  PartnerUltrafieldsIconCircle,
  VaultUsdIcon,
} from 'assets/earn-v2';
import { VaultPage } from 'features/earn/shared/v2/vault-page/vault-page';

import { UsdVaultPositionManager } from './position-manager/position-manager';
import { EarnUsdFaq } from './faq/faq';
import { EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_WITHDRAW_SLUG } from '../consts';
import { useUsdVaultStats } from './hooks/use-vault-stats';
import { useUsdVaultApy } from './hooks/use-vault-apy';
import { Disclaimers } from '../shared/v2/disclaimers';
import { UsdVaultApyHint } from './components/apy-hint';

const FEES = [
  { label: 'Performance fee', value: '10%' },
  { label: 'Platform fee', value: '1%' },
];

const GENERAL_INFO_LEFT = [
  {
    label: 'Curators',
    value: (
      <>
        <PartnerUltrafieldsIconCircle width={20} height={20} />{' '}
        <Link href="https://ultrayield.app/">UltraYield by Edge ↗</Link>
      </>
    ),
  },
  { label: 'Vault contract deployed', value: '02 Feb 2026' },
  {
    label: 'Audit',
    value: (
      <>
        <PartnerNethermindIconCircle width={20} height={20} />
        <Link href="https://content.gitbook.com/content/PyujKH9RYkVLASDhGflO/blobs/15Q3SGxZgZ9VEWqXueO2/Nethermind_Mellow-Core-Vaults_20250903.pdf">
          Nethermind ↗
        </Link>
      </>
    ),
  },
  { label: 'Last audit date', value: '21 Jan 2026' },
];

const GENERAL_INFO_RIGHT: Array<{ label: ReactNode; value?: ReactNode }> = [
  { label: 'Deposit wait time', value: '24 hours' },
  { label: 'Withdrawal wait time', value: 'up to 72 hours' },
  {
    label: (
      <Link href="https://etherscan.io/token/0x974D2CD0584b22650B1C9617bb209c5196652c1A">
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
    The EarnUSD vault is designed to optimize USD-based returns by allocating
    capital across a diversified selection of DeFi protocols and strategies
    within the broader ecosystem. The vault provides exposure to multiple DeFi
    positions, each carrying smart contract risk and different levels of market
    and economic risk. Its strategies include liquidity provision, which may
    lead to impermanent loss, and the use of leverage, introducing potential
    liquidation risk. Please note that the Liquid vault is not available to U.S.
    persons, U.S. residents, or individuals located in other restricted
    jurisdictions.{' '}
    <Link href="https://lido.fi/earn/risk-disclosures">
      See this for further disclosures
    </Link>
    .
  </>
);

const DATA = {
  title: 'EarnUSD',
  description:
    'EarnUSD Vault is curated for USD-denominated assets, designed to target an optimal risk-reward profile without compromising on security, risk controls, or asset quality. It’s built to feel like saving',
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
  const { totalTvlUsd, isLoading: isTvlLoading } = useUsdVaultStats();

  return (
    <>
      <VaultPage
        {...DATA}
        apx={apy}
        tvl={totalTvlUsd}
        isApxLoading={isApyLoading}
        isTvlLoading={isTvlLoading}
        apxHint={<UsdVaultApyHint />}
        sidePanel={<UsdVaultPositionManager action={action} />}
        vaultName="usdVault"
        faqContent={<EarnUsdFaq />}
      />
      <Disclaimers />
    </>
  );
};
