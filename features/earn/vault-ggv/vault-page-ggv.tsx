import type { FC } from 'react';

import { EARN_PATH } from 'consts/urls';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { useDappStatus } from 'modules/web3';

import { ButtonBack } from 'shared/components/button-back/button-back';

import {
  Partner7SeasIcon,
  PartnerVedaIcon,
  TokenGGIcon,
  VaultGGVIcon,
} from 'assets/earn';

import { VaultHeader } from '../shared/vault-header';
import { VaultDescription } from '../shared/vault-description';
import { VaultSwitch } from '../shared/vault-switch';
import { VaultStats } from '../shared/vault-stats';
import { VaultPosition } from '../shared/vault-position';
import { VaultLegal } from '../shared/vault-legal';
import { VaultBlock } from '../shared/vault-block';
import {
  EARN_VAULT_GGV_SLUG,
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from '../consts';

import { GGVDepositForm } from './deposit';
import { GGVWithdrawForm } from './withdraw';
import { useGGVStats } from './hooks/use-ggv-stats';
import { useGGVPosition } from './hooks/use-ggv-position';
import { GGV_TOKEN_SYMBOL } from './consts';

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
    matomoEvent: MATOMO_EARN_EVENTS_TYPES.ggvDepositTabClick,
  },
  {
    path: `${EARN_PATH}/${EARN_VAULT_GGV_SLUG}/${EARN_VAULT_WITHDRAW_SLUG}`,
    name: 'Withdraw',
    matomoEvent: MATOMO_EARN_EVENTS_TYPES.ggvWithdrawTabClick,
  },
];

export const VaultPageGGV: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const isDeposit = action === EARN_VAULT_DEPOSIT_SLUG;
  const isWithdraw = action === EARN_VAULT_WITHDRAW_SLUG;

  const { isWalletConnected } = useDappStatus();
  const { tvl, apy, isLoading } = useGGVStats();
  const {
    data,
    usdBalance,
    isLoading: isLoadingPosition,
    usdQuery: { isLoading: isLoadingUsd },
  } = useGGVPosition();

  return (
    <>
      <ButtonBack
        url={EARN_PATH}
        onClick={() => {
          trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvBackToAllVaults);
        }}
      >
        Back to all vaults
      </ButtonBack>
      <VaultBlock>
        <VaultHeader
          title={`Lido GGV`}
          logo={<VaultGGVIcon />}
          partners={partners}
        />
        <VaultStats tvl={tvl} apy={apy} isLoading={isLoading} />
        <VaultDescription description={description} />
        {isWalletConnected && (
          <VaultPosition
            position={{
              symbol: GGV_TOKEN_SYMBOL,
              token: data?.ggvTokenAddress,
              balance: data?.sharesBalance,
              icon: <TokenGGIcon />,
              isLoading: isLoadingPosition || isLoadingUsd,
              usdAmount: usdBalance,
            }}
          />
        )}
        <VaultSwitch routes={routes} checked={isWithdraw} fullwidth />
        {isDeposit && <GGVDepositForm />}
        {isWithdraw && <GGVWithdrawForm />}
        <VaultLegal />
      </VaultBlock>
    </>
  );
};
