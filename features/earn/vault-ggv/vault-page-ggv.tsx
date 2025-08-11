import { FC } from 'react';
import { Block } from '@lidofinance/lido-ui';

import {
  EARN_PATH,
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_GGV_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from 'consts/urls';

import { ButtonBack } from 'shared/components/button-back/button-back';

import { Partner7SeasIcon, PartnerVedaIcon, VaultGGVIcon } from 'assets/earn';

import { VaultHeader } from '../shared/vault-header';
import { VaultDescription } from '../shared/vault-description';
import { SwitchStyled } from '../shared/styles';

import { GGVDepositForm } from './deposit';
import { GGVWithdrawForm } from './withdraw';
import { useGGVStats } from './hooks/use-ggv-stats';
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
const routes = [
  {
    path: `${EARN_PATH}/${EARN_VAULT_GGV_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`,
    name: 'Deposit',
  },
  {
    path: `${EARN_PATH}/${EARN_VAULT_GGV_SLUG}/${EARN_VAULT_WITHDRAW_SLUG}`,
    name: 'Withdraw',
  },
];

export const VaultPageGGV: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const isDeposit = action === EARN_VAULT_DEPOSIT_SLUG;
  const isWithdraw = action === EARN_VAULT_WITHDRAW_SLUG;

  const { tvl, apy, isLoading } = useGGVStats();
  return (
    <>
      <ButtonBack url={EARN_PATH}>Back to all vaults</ButtonBack>
      <Block>
        <VaultHeader
          title={`Lido GGV`}
          logo={<VaultGGVIcon />}
          partners={partners}
        />
        <VaultStats tvl={tvl} apy={apy} isLoading={isLoading} />;
        <VaultDescription description={description} />
        <SwitchStyled routes={routes} checked={isWithdraw} fullwidth />
        {isDeposit && <GGVDepositForm />}
        {isWithdraw && <GGVWithdrawForm />}
      </Block>
    </>
  );
};
