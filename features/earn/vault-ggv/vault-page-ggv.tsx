import type { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';

import { EARN_PATH } from 'consts/urls';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { TokenGGIcon, VaultGGVIcon } from 'assets/earn';
import { useDappStatus } from 'modules/web3';
import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { AprDisclaimer } from 'shared/components/apr-disclaimer/apr-disclaimer';

import { Allocation } from './allocation';
import { VaultHeader } from '../shared/vault-header';
import { VaultDescription } from '../shared/vault-description';
import { VaultSwitch } from '../shared/vault-switch';
import { VaultStats } from '../shared/vault-stats';
import { VaultPosition } from '../shared/vault-position';
import { VaultLegal } from '../shared/vault-legal';
import { ButtonBack } from '../shared/button-back';
import {
  VaultBlock,
  VaultBlockFormSection,
  VaultBlockHeaderSection,
} from '../shared/vault-block';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
  GGV_DEPOSIT_PATH,
  GGV_WITHDRAW_PATH,
} from '../consts';

import { GGVDepositForm } from './deposit';
import { GGVWithdrawForm } from './withdraw';
import { useGGVStats } from './hooks/use-ggv-stats';
import { useGGVPosition } from './hooks/use-ggv-position';
import {
  GGV_VAULT_DESCRIPTION,
  GGV_PARTNERS,
  GGV_TOKEN_SYMBOL,
} from './consts';
import { GGVFaq } from './faq/ggv-faq';
import { GGVApyHint } from './components/ggv-apy-hint';
import { GGVVaultDetails } from './components/ggv-vault-details';

const routes = [
  {
    path: GGV_DEPOSIT_PATH,
    name: 'Deposit',
    matomoEvent: MATOMO_EARN_EVENTS_TYPES.ggvDepositTabClick,
  },
  {
    path: GGV_WITHDRAW_PATH,
    name: 'Withdraw',
    matomoEvent: MATOMO_EARN_EVENTS_TYPES.ggvWithdrawTabClick,
  },
];

export const VaultPageGGV: FC<{
  action: typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;
}> = ({ action }) => {
  const isDeposit = action === EARN_VAULT_DEPOSIT_SLUG;
  const isWithdraw = action === EARN_VAULT_WITHDRAW_SLUG;

  const { isDappActive } = useDappStatus();
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
        <VaultBlockHeaderSection>
          <VaultHeader
            title={`Lido GGV`}
            logo={<VaultGGVIcon />}
            partners={GGV_PARTNERS}
          />
          <VaultStats
            compact
            tvl={tvl}
            apxLabel="APY"
            apx={apy}
            apxHint={<GGVApyHint />}
            isLoading={isLoading}
          />
          <VaultDescription description={GGV_VAULT_DESCRIPTION} />
        </VaultBlockHeaderSection>
        {isDappActive && (
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
        <VaultBlockFormSection>
          <VaultSwitch routes={routes} checked={isWithdraw} fullwidth />
          {isDeposit && <GGVDepositForm />}
          {isWithdraw && <GGVWithdrawForm />}
          <VaultLegal
            legalDisclosure={
              <span>
                Lido GGV service relies on third-party infrastructure provided
                by Veda. By proceeding, you are subject to Veda’s{' '}
                <Link href="https://veda.tech/terms">Terms of Service</Link> and{' '}
                <Link href="https://veda.tech/privacy-policy">
                  Privacy Policy
                </Link>{' '}
                as well as{' '}
                <Link href="https://lido.fi/terms-of-use">
                  Lido’s Terms of Use
                </Link>
                .
                <br />
                <br />
                Note, that the vault involves protocol, slashing and other
                risks. You can find more details in the{' '}
                <LinkInpageAnchor
                  pagePath={isDeposit ? GGV_DEPOSIT_PATH : GGV_WITHDRAW_PATH}
                  hash="#what-are-risks-outlined-in-the-vault"
                >
                  FAQ
                </LinkInpageAnchor>{' '}
                below.
              </span>
            }
          />
        </VaultBlockFormSection>
      </VaultBlock>
      <Allocation />
      <GGVVaultDetails />
      <GGVFaq />
      <AprDisclaimer mentionAPY />
    </>
  );
};
