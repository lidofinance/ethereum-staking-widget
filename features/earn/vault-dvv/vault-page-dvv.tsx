import { FC } from 'react';
import { Block } from '@lidofinance/lido-ui';

import { ButtonBack } from 'shared/components/button-back/button-back';
import { PartnerStakehouseIcon, VaultDDVIcon } from 'assets/earn';

import { VaultDescription } from '../shared/vault-description';
import { VaultHeader } from '../shared/vault-header';
import { VaultStats } from '../shared/vault-stats';
import { VaultSwitch } from '../shared/vault-switch';

import {
  EARN_PATH,
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_DVV_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from 'consts/urls';
import { DVVDepositForm } from './deposit';
import { DVVWithdrawForm } from './withdraw';
import { VaultLegal } from '../shared/vault-legal';

const partners = [
  {
    role: 'Curated by',
    icon: <PartnerStakehouseIcon />,
    text: 'Stakehouse Financial',
  },
];
const description =
  'The Decentralized Validator Vault accepts ETH deposits to the Lido protocol, accelerating the adoption of Distributed Validator Technology (DVT)';
const stats = { tvl: 86000000, apy: 4.4 };
const routes = [
  {
    path: `${EARN_PATH}/${EARN_VAULT_DVV_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`,
    name: 'Deposit',
  },
  {
    path: `${EARN_PATH}/${EARN_VAULT_DVV_SLUG}/${EARN_VAULT_WITHDRAW_SLUG}`,
    name: 'Withdraw',
  },
];

export const VaultPageDVV: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const isDeposit = action === EARN_VAULT_DEPOSIT_SLUG;
  const isWithdraw = action === EARN_VAULT_WITHDRAW_SLUG;

  return (
    <>
      <ButtonBack url={EARN_PATH}>Back to all vaults</ButtonBack>
      <Block>
        <VaultHeader
          title={`Lido DVV`}
          logo={<VaultDDVIcon />}
          partners={partners}
        />
        {stats && <VaultStats tvl={stats.tvl} apy={stats.apy} />}
        <VaultDescription description={description} />
        <VaultSwitch routes={routes} checked={isWithdraw} fullwidth />
        {isDeposit && <DVVDepositForm />}
        {isWithdraw && <DVVWithdrawForm />}
        <VaultLegal />
      </Block>
    </>
  );
};
