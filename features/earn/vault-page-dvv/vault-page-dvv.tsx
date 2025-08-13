import { FC } from 'react';
import { Block } from '@lidofinance/lido-ui';

import { ButtonBack } from 'shared/components/button-back/button-back';
import { PartnerStakehouseIcon, VaultDDVIcon } from 'assets/earn';
import { VaultDescription } from '../shared/vault-description';
import { VaultHeader } from '../shared/vault-header';
import { VaultStats } from '../shared/vault-stats';

const partners = [
  {
    role: 'Curated by',
    icon: <PartnerStakehouseIcon />,
    text: 'Stakehouse Financial',
  },
];
const description =
  'The Decentralized Validator Vault accepts ETH deposits to the Lido protocol, accelerating the adoption of Distributed Validator Technology (DVT)';
const stats = { tvl: '86', apy: '4.4' };

export const VaultPageDVV: FC<{ action: 'deposit' | 'withdraw' }> = ({
  action,
}) => (
  <>
    <ButtonBack url="/earn">Back to all vaults</ButtonBack>
    <Block>
      <VaultHeader
        title={`Lido DVV`}
        logo={<VaultDDVIcon />}
        partners={partners}
      />
      {stats && <VaultStats tvl={stats.tvl} apy={stats.apy} />}
      <VaultDescription description={description} />
      {action}
    </Block>
  </>
);
