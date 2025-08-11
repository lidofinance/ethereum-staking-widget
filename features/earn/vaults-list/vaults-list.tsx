import { FC } from 'react';
import { VaultCard } from './components/vault-card/vault-card';
import { VaultsListWrapper } from './styles';
import {
  VaultDDVIcon,
  PartnerStakehouseIcon,
  TokenEthIcon,
  TokenWethIcon,
} from 'assets/earn';
import { EARN_VAULT_DVV_SLUG } from 'consts/urls';
import { VaultCardGGV } from '../vault-ggv';

export const EarnVaultsList: FC = () => {
  return (
    <VaultsListWrapper>
      <VaultCardGGV />
      <VaultCard
        title="Lido DVV"
        description="The Decentralized Validator Vault accepts ETH deposits to the Lido protocol, accelerating the adoption of Distributed Validator Technology (DVT)"
        urlSlug={EARN_VAULT_DVV_SLUG}
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
        stats={{ tvl: 86, apy: 4.4 }}
        logo={<VaultDDVIcon />}
      />
    </VaultsListWrapper>
  );
};
