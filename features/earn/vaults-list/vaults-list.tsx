import { FC } from 'react';
import { VaultCard } from './components/vault-card/vault-card';
import { VaultsListWrapper } from './styles';
import {
  VaultDDVIcon,
  VaultGGVIcon,
  Partner7SeasIcon,
  PartnerStakehouseIcon,
  PartnerVedaIcon,
  TokenEthIcon,
  TokenStethIcon,
  TokenWethIcon,
  TokenWstethIcon,
} from 'assets/earn';

export const EarnVaultsList: FC = () => {
  return (
    <VaultsListWrapper>
      <VaultCard
        title="Lido GGV"
        description="Lido GGV leverages top DeFi protocols to maximize rewards on your stETH, with a single deposit."
        urlSlug="ggv"
        partners={[
          { role: 'Curated by', icon: <Partner7SeasIcon />, text: '7seas' },
          {
            role: 'Infrastructure provider',
            icon: <PartnerVedaIcon />,
            text: 'Veda',
          },
        ]}
        tokens={[
          { name: 'ETH', logo: <TokenEthIcon /> },
          { name: 'WETH', logo: <TokenWethIcon /> },
          { name: 'stETH', logo: <TokenStethIcon /> },
          { name: 'wstETH', logo: <TokenWstethIcon /> },
        ]}
        stats={{ tvl: '431', apy: '10.4' }}
        logo={<VaultGGVIcon />}
      />
      <VaultCard
        title="Lido DVV"
        description="The Decentralized Validator Vault accepts ETH deposits to the Lido protocol, accelerating the adoption of Distributed Validator Technology (DVT)"
        urlSlug="dvv"
        partners={[
          {
            role: 'Curated by',
            icon: <PartnerStakehouseIcon />,
            text: 'Stakehouse Financial',
          },
        ]}
        tokens={[
          { name: 'ETH', logo: <TokenEthIcon /> },
          { name: 'WETH', logo: <TokenWethIcon /> },
        ]}
        stats={{ tvl: '86', apy: '4.4' }}
        logo={<VaultDDVIcon />}
      />
    </VaultsListWrapper>
  );
};
