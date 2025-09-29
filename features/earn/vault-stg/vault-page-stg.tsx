import type { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';

import { EARN_PATH } from 'consts/urls';

import { VaultSTGIcon } from 'assets/earn';
import { useDappStatus } from 'modules/web3';
import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { AprDisclaimer } from 'shared/components/apr-disclaimer/apr-disclaimer';

import { VaultHeader } from '../shared/vault-header';
import { VaultDescription } from '../shared/vault-description';
import { VaultSwitch } from '../shared/vault-switch';
import { VaultStats } from '../shared/vault-stats';
import { VaultLegal } from '../shared/vault-legal';
import { ButtonBack } from '../shared/button-back';
import {
  VaultBlock,
  VaultBlockFormSection,
  VaultBlockHeaderSection,
} from '../shared/vault-block';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_STG_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
  STG_DEPOSIT_PATH,
} from '../consts';

import { STGDepositForm } from './deposit';
import { STGWithdrawForm } from './withdraw';
import { useSTGStats } from './hooks/use-stg-stats';
import { STG_VAULT_DESCRIPTION, STG_PARTNERS } from './consts';
import { STGPosition } from './stg-position/stg-position';

const routes = [
  {
    path: `${EARN_PATH}/${EARN_VAULT_STG_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`,
    name: 'Deposit',
  },
  {
    path: `${EARN_PATH}/${EARN_VAULT_STG_SLUG}/${EARN_VAULT_WITHDRAW_SLUG}`,
    name: 'Withdraw',
  },
];

export const VaultPageSTG: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const isDeposit = action === EARN_VAULT_DEPOSIT_SLUG;
  const isWithdraw = action === EARN_VAULT_WITHDRAW_SLUG;

  const { isDappActive } = useDappStatus();
  const { tvl, apy, isLoading } = useSTGStats();

  return (
    <>
      <ButtonBack url={EARN_PATH} onClick={() => {}}>
        Back to all vaults
      </ButtonBack>
      <VaultBlock>
        <VaultBlockHeaderSection>
          <VaultHeader
            title={'Lido stRATEGY'}
            logo={<VaultSTGIcon />}
            partners={STG_PARTNERS}
          />
          <VaultStats
            compact
            tvl={tvl}
            apxLabel="APY"
            apx={apy}
            isLoading={isLoading}
          />
          <VaultDescription description={STG_VAULT_DESCRIPTION} />
        </VaultBlockHeaderSection>
        {isDappActive && <STGPosition />}
        <VaultBlockFormSection>
          <VaultSwitch routes={routes} checked={isWithdraw} fullwidth />
          {isDeposit && <STGDepositForm />}
          {isWithdraw && <STGWithdrawForm />}
          <VaultLegal
            legalDisclosure={
              <span>
                stRATEGY’s service relies on third-party infrastructure provided
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
                <LinkInpageAnchor
                  pagePath={STG_DEPOSIT_PATH}
                  hash="#risks-of-depositing"
                >
                  FAQ
                </LinkInpageAnchor>{' '}
                below.
              </span>
            }
          />
        </VaultBlockFormSection>
      </VaultBlock>
      <AprDisclaimer mentionAPY />
    </>
  );
};
