import { FC } from 'react';

import { VaultDDVIcon } from 'assets/earn';

import { VaultDescription } from '../shared/vault-description';
import { VaultHeader } from '../shared/vault-header';
import { VaultStats } from '../shared/vault-stats';
import { VaultSwitch } from '../shared/vault-switch';
import { VaultLegal } from '../shared/vault-legal';
import { ButtonBack } from '../shared/button-back';

import {
  VaultBlock,
  VaultBlockFormSection,
  VaultBlockHeaderSection,
} from '../shared/vault-block';
import {
  EARN_VAULT_DVV_SLUG,
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from '../consts';

import { EARN_PATH } from 'consts/urls';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

import { DVVDepositForm } from './deposit';
import { DVVWithdrawForm } from './withdraw';
import { DVVPosition } from './dvv-position';

import { useDVVStats } from './hooks/use-dvv-stats';
import { DVV_PARTNERS } from './consts';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { DVVAprBreakdown } from './dvv-apr-breakdown';
import { DVVFaq } from './faq/dvv-faq';

const description =
  'The Decentralized Validator Vault accepts ETH deposits to the Lido protocol, accelerating the adoption of Distributed Validator Technology (DVT)';
const routes = [
  {
    path: `${EARN_PATH}/${EARN_VAULT_DVV_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`,
    name: 'Deposit',
    matomoEvent: MATOMO_EARN_EVENTS_TYPES.dvvDepositTabClick,
  },
  {
    path: `${EARN_PATH}/${EARN_VAULT_DVV_SLUG}/${EARN_VAULT_WITHDRAW_SLUG}`,
    name: 'Withdraw',
    matomoEvent: MATOMO_EARN_EVENTS_TYPES.dvvWithdrawTabClick,
  },
];

export const VaultPageDVV: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const isDeposit = action === EARN_VAULT_DEPOSIT_SLUG;
  const isWithdraw = action === EARN_VAULT_WITHDRAW_SLUG;
  const { tvl, apr, isLoading: isLoadingStats } = useDVVStats();

  return (
    <>
      <ButtonBack
        url={EARN_PATH}
        onClick={() => {
          trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.dvvBackToAllVaults);
        }}
      >
        Back to all vaults
      </ButtonBack>
      <VaultBlock>
        <VaultBlockHeaderSection>
          <VaultHeader
            title={`Lido DVV`}
            logo={<VaultDDVIcon />}
            partners={DVV_PARTNERS}
          />
          <VaultStats
            compact
            tvl={tvl}
            apxLabel="APR"
            apx={apr}
            apxHint={<DVVAprBreakdown />}
            isLoading={isLoadingStats}
          />

          <VaultDescription description={description} />
        </VaultBlockHeaderSection>
        <DVVPosition />
        <VaultBlockFormSection>
          <VaultSwitch routes={routes} checked={isWithdraw} fullwidth />
          {isDeposit && <DVVDepositForm />}
          {isWithdraw && <DVVWithdrawForm />}
          <VaultLegal allocation={null} />
        </VaultBlockFormSection>
      </VaultBlock>
      <DVVFaq />
    </>
  );
};
