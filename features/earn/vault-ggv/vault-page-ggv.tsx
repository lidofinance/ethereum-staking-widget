import type { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';

import { EARN_PATH } from 'consts/urls';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { TokenGGIcon, VaultGGVIcon } from 'assets/earn';
import { useDappStatus } from 'modules/web3';

import { VaultHeader } from '../shared/vault-header';
import { VaultDescription } from '../shared/vault-description';
import { VaultSwitch } from '../shared/vault-switch';
import { VaultStats } from '../shared/vault-stats';
import { VaultPosition } from '../shared/vault-position';
import { VaultLegal } from '../shared/vault-legal';
import { ButtonBack } from '../shared/button-back';
import { VaultDisclaimer } from '../shared/vault-disclaimer';
import {
  VaultBlock,
  VaultBlockFormSection,
  VaultBlockHeaderSection,
} from '../shared/vault-block';
import {
  EARN_VAULT_GGV_SLUG,
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from '../consts';

import { GGVDepositForm } from './deposit';
import { GGVWithdrawForm } from './withdraw';
import { useGGVStats } from './hooks/use-ggv-stats';
import { useGGVPosition } from './hooks/use-ggv-position';
import { GGV_PARTNERS, GGV_TOKEN_SYMBOL } from './consts';
import { GGVFaq } from './faq/ggv-faq';
import { GGVApyHint } from './ggv-apy-hint';
import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';

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
          <VaultDescription description={description} />
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
                as well as Lido’s Terms of Use.
                <br />
                <br />
                Note, that the vault involves protocol, slashing and other
                risks. You can find more details in the{' '}
                <LinkInpageAnchor hash="#risks-of-depositing">
                  FAQ
                </LinkInpageAnchor>{' '}
                below.
              </span>
            }
            allocation={
              <>
                Your deposit is distributed across a curated set of
                high-performing DeFi strategies, including lending markets
                (Aave, Fluid) and LP positions (Uniswap v4, Balancer). <br />
                The exact allocation may vary over time based on market
                conditions and strategy performance. All strategies are
                ETH-correlated to help minimize risk from price volatility.
              </>
            }
          />
        </VaultBlockFormSection>
      </VaultBlock>
      <GGVFaq />
      <VaultDisclaimer />
    </>
  );
};
