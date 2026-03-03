import { Link } from '@lidofinance/lido-ui';
import type { FC, ReactNode } from 'react';

import { VaultEthIcon } from 'assets/earn-v2';
import { VaultPage } from 'features/earn/shared/v2/vault-page/vault-page';
import type { InfoItem } from 'features/earn/shared/v2/vault-page/vault-page';

import { EthVaultPositionManager } from './position-manager/position-manager';
import { EarnEthFaq } from './faq/faq';
import { useEthVaultStats } from './hooks/use-vault-stats';
import { useEthVaultApy } from './hooks/use-vault-apy';
import { EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_WITHDRAW_SLUG } from '../consts';

const FEES = [
  { label: 'Performance fee', value: '10%' },
  { label: 'Platform fee', value: '1%' },
];

const GENERAL_INFO_LEFT: InfoItem[] = [
  {
    label: 'Curators',
    value: <Link href="https://ultrayield.app/">UltraYield by Edge ↗</Link>,
  },
  {
    label: '',
    value: <Link href="https://veda.tech/">Veda ↗</Link>,
  },
  { label: 'Vault contract deployed', value: '02 Feb 2026' },
  {
    label: 'Audit',
    value: (
      <Link href="https://content.gitbook.com/content/PyujKH9RYkVLASDhGflO/blobs/15Q3SGxZgZ9VEWqXueO2/Nethermind_Mellow-Core-Vaults_20250903.pdf">
        Nethermind ↗
      </Link>
    ),
  },
  { label: 'Last audit date', value: '21 Jan 2026' },
];

const GENERAL_INFO_RIGHT: Array<{ label: ReactNode; value?: ReactNode }> = [
  { label: 'Deposit wait time', value: '24 hours' },
  { label: 'Withdrawal wait time', value: 'up to 72 hours' },
  {
    label: (
      <Link href="https://etherscan.io/token/0xBBFC8683C8fE8cF73777feDE7ab9574935fea0A4">
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
  title: 'EarnETH',
  description:
    'EarnETH is an ETH growth vault allocating ETH and stETH across leading, blue-chip DeFi protocols meant to optimize for capital efficiency',
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
  const { totalTvlUsd, isLoading: isTvlLoading } = useEthVaultStats();

  return (
    <VaultPage
      {...DATA}
      apx={apy}
      tvl={totalTvlUsd}
      isApxLoading={isApyLoading}
      isTvlLoading={isTvlLoading}
      sidePanel={<EthVaultPositionManager action={action} />}
      vaultName="ethVault"
      faqContent={<EarnEthFaq />}
    />
  );
};
