import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';

import { VaultDVVIcon } from 'assets/earn';

import { EARN_PATH } from 'consts/urls';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { AprDisclaimer } from 'shared/components/apr-disclaimer/apr-disclaimer';

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

import { DVVDepositForm } from './deposit';
import { DVVWithdrawForm } from './withdraw';
import { DVVPosition } from './dvv-position';

import { useDVVStats } from './hooks/use-dvv-stats';
import { DVV_PARTNERS, DVV_VAULT_DESCRIPTION } from './consts';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { DVVAprBreakdown } from './dvv-apr-breakdown';
import { DVVFaq } from './faq/dvv-faq';

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
            logo={<VaultDVVIcon />}
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

          <VaultDescription description={DVV_VAULT_DESCRIPTION} />
        </VaultBlockHeaderSection>
        <DVVPosition />
        <VaultBlockFormSection>
          <VaultSwitch routes={routes} checked={isWithdraw} fullwidth />
          {isDeposit && <DVVDepositForm />}
          {isWithdraw && <DVVWithdrawForm />}
          <VaultLegal
            legalDisclosure={
              <>
                Lido DVV service relies on third-party infrastructure provided
                by Mellow. By proceeding, you are subject to Mellow’s{' '}
                <Link href="https://mellow.finance/Mellow-Terms-of-Service.pdf">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="https://mellow.finance/Mellow-Privacy-Notice.pdf">
                  Privacy Notice
                </Link>
                .
                <br />
                <br />
                Note, that the vault involves protocol, slashing and other
                risks. You can find more details in the{' '}
                <LinkInpageAnchor hash="#risks-of-depositing">
                  FAQ
                </LinkInpageAnchor>{' '}
                below.
              </>
            }
            allocation={null}
          />
        </VaultBlockFormSection>
      </VaultBlock>
      <DVVFaq />
      <AprDisclaimer />
    </>
  );
};
