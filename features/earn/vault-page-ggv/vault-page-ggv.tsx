import { FC } from 'react';
import { Block } from '@lidofinance/lido-ui';

import { ButtonBack } from 'shared/components/button-back/button-back';
import { VaultHeader } from '../shared/vault-header';
import { Partner7SeasIcon, PartnerVedaIcon, VaultGGVIcon } from 'assets/earn';
import { VaultDescription } from '../shared/vault-description';
import { VaultStats } from '../shared/vault-stats';

const partners = [
  { role: 'Curated by', icon: <Partner7SeasIcon />, text: '7seas' },
  {
    role: 'Infrastructure provider',
    icon: <PartnerVedaIcon />,
    text: 'Veda',
  },
];
const description =
  'Lido GGV leverages top DeFi protocols to maximize rewards on your stETH, with a single deposit.';
const stats = { tvl: '431', apy: '10.4' };

export const VaultPageGGV: FC<{ action: 'deposit' | 'withdraw' }> = ({
  action,
}) => (
  <>
    <ButtonBack url="/earn">Back to all vaults</ButtonBack>
    <Block>
      <VaultHeader
        title={`Lido GGV`}
        logo={<VaultGGVIcon />}
        partners={partners}
      />
      {stats && <VaultStats tvl={stats.tvl} apy={stats.apy} />}
      <VaultDescription description={description} />
      {action}
    </Block>
  </>
);
