import type { FC } from 'react';

import { EARN_PATH } from 'consts/urls';

import { TokenDvstethIcon, VaultSTGIcon } from 'assets/earn';
import { useDappStatus } from 'modules/web3';
import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { AprDisclaimer } from 'shared/components/apr-disclaimer/apr-disclaimer';

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
  EARN_VAULT_STG_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from '../consts';

import { STGDepositForm } from './deposit';
import { STGWithdrawForm } from './withdraw';
import { useSTGStats as usePlaceholderStats } from './hooks/use-stg-stats';
import { useSTGPosition as usePlaceholderPosition } from './hooks/use-stg-position';
import {
  STG_VAULT_DESCRIPTION,
  STG_PARTNERS,
  STG_TOKEN_SYMBOL,
} from './consts';

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
  const { tvl, apy, isLoading } = usePlaceholderStats();
  const {
    data,
    usdBalance,
    isLoading: isLoadingPosition,
    usdQuery: { isLoading: isLoadingUsd } = { isLoading: false },
  } = usePlaceholderPosition() as any;

  return (
    <>
      <ButtonBack url={EARN_PATH} onClick={() => {}}>
        Back to all vaults
      </ButtonBack>
      <VaultBlock>
        <VaultBlockHeaderSection>
          <VaultHeader
            title={`Lido STG`}
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
        {isDappActive && (
          <VaultPosition
            position={{
              symbol: STG_TOKEN_SYMBOL,
              token: data?.ggvTokenAddress,
              balance: data?.sharesBalance,
              icon: <TokenDvstethIcon />,
              isLoading: isLoadingPosition || isLoadingUsd,
              usdAmount: usdBalance,
            }}
          />
        )}
        <VaultBlockFormSection>
          <VaultSwitch routes={routes} checked={isWithdraw} fullwidth />
          {isDeposit && <STGDepositForm />}
          {isWithdraw && <STGWithdrawForm />}
          <VaultLegal
            legalDisclosure={
              <span>
                This is a placeholder STG vault. Full terms and implementation
                will be provided when the vault is activated.
                <br />
                <br />
                See the{' '}
                <LinkInpageAnchor hash="#risks-of-depositing">
                  FAQ
                </LinkInpageAnchor>{' '}
                below.
              </span>
            }
            allocation={
              <span>Allocation details will be available after launch.</span>
            }
          />
        </VaultBlockFormSection>
      </VaultBlock>
      <AprDisclaimer mentionAPY />
    </>
  );
};
