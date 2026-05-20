import { type FC, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDappStatus } from 'modules/web3';
import { TOKENS, TOKEN_SYMBOLS } from 'consts/tokens';
import { TokenGGIcon, TokenDvstethIcon, TokenStrethIcon } from 'assets/earn-v2';
import { FormatToken } from 'shared/formatters/format-token';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MELLOW_VAULTS_QUERY_SCOPE } from 'modules/mellow-meta-vaults/consts';
import { overrideWithQAMockBigInt } from 'utils/qa';
import { useReferralQueryValue } from 'shared/hooks/use-query-values-form';

import {
  UpgradeAssets,
  UpgradeAssetsHeader,
  UpgradeAssetsTitle,
  UpgradeAssetsHowItWorksButton,
  UpgradeAssetsRow,
  UpgradeAssetsAmount,
  UpgradeAssetsButton,
  UpgradeAssetsTokenIcon,
} from './styles';
import { useUpgradableTokenBalances } from './use-upgradable-token-balances';
import {
  ETH_VAULT_DEPOSIT_TOKENS_UPGRADABLE,
  ETH_VAULT_QUERY_SCOPE,
} from '../consts';
import { useEthVaultDrawer } from '../drawer-context';
import { useEthVaultDeposit } from '../deposit/hooks';
import { EthDepositTokenUpgradable } from '../types';

const TOKEN_ICON_MAP = {
  [TOKENS.gg]: <TokenGGIcon />,
  [TOKENS.streth]: <TokenStrethIcon />,
  [TOKENS.dvsteth]: <TokenDvstethIcon />,
};

const getMatomoEventForToken = (token: EthDepositTokenUpgradable) => {
  switch (token) {
    case TOKENS.gg:
      return MATOMO_EARN_EVENTS_TYPES.earnEthGgTokenUpgrade;
    case TOKENS.streth:
      return MATOMO_EARN_EVENTS_TYPES.earnEthStrethTokenUpgrade;
    case TOKENS.dvsteth:
      return MATOMO_EARN_EVENTS_TYPES.earnEthDvstethTokenUpgrade;
    default:
      return undefined;
  }
};

type UpgradeArgs = {
  token: EthDepositTokenUpgradable;
};

export const UpgradeAssetsBlock: FC = () => {
  const { isWalletConnected } = useDappStatus();
  const queryClient = useQueryClient();
  const { balances, refetchBalances } = useUpgradableTokenBalances();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const referral = useReferralQueryValue();
  const { openDrawer: openDrawerRight } = useEthVaultDrawer();

  const { deposit } = useEthVaultDeposit();

  const upgrade = useCallback(
    async ({ token }: UpgradeArgs) => {
      setIsUpgrading(true);

      try {
        const balancesQuery = await refetchBalances();
        if (!balancesQuery.isSuccess) return;

        const balanceAmount = balancesQuery.data?.[token] ?? 0n;
        const depositAmount = overrideWithQAMockBigInt(
          balanceAmount,
          'mock-qa-helpers-earn-eth-upgrade-amount',
        );

        if (!depositAmount) return;

        const isDepositSuccessful = await deposit({
          amount: depositAmount,
          token,
          referral,
        });
        if (isDepositSuccessful) {
          const matomoEvent = getMatomoEventForToken(token);
          if (matomoEvent) {
            trackMatomoEvent(matomoEvent);
          }
          await refetchBalances();
          await Promise.all([
            queryClient.refetchQueries(
              { queryKey: [MELLOW_VAULTS_QUERY_SCOPE] },
              { cancelRefetch: true, throwOnError: false },
            ),
            // for refetching the vault user balance
            queryClient.refetchQueries(
              { queryKey: [ETH_VAULT_QUERY_SCOPE] },
              { cancelRefetch: true, throwOnError: false },
            ),
          ]);
        }
      } finally {
        setIsUpgrading(false);
      }
    },
    [deposit, queryClient, referral, refetchBalances],
  );

  if (!isWalletConnected) return null;

  const tokensWithBalance = ETH_VAULT_DEPOSIT_TOKENS_UPGRADABLE.filter(
    (token) => {
      const balance = balances[token];
      return balance != null && balance > 0n;
    },
  );

  if (tokensWithBalance.length === 0) return null;

  return (
    <UpgradeAssets data-testid={'availableToUpgradeBanner'}>
      <UpgradeAssetsHeader>
        <UpgradeAssetsTitle>Assets available to upgrade</UpgradeAssetsTitle>
        <UpgradeAssetsHowItWorksButton
          onClick={() => {
            trackMatomoEvent(
              MATOMO_EARN_EVENTS_TYPES.earnListEarnEthBannerLearnHowItWorks,
            );
            openDrawerRight();
          }}
          data-testid={'howItWorksButton'}
        >
          How it works
        </UpgradeAssetsHowItWorksButton>
      </UpgradeAssetsHeader>
      {tokensWithBalance.map((token) => (
        <UpgradeAssetsRow key={token} data-testid={token}>
          <UpgradeAssetsAmount>
            <UpgradeAssetsTokenIcon>
              {TOKEN_ICON_MAP[token]}
            </UpgradeAssetsTokenIcon>
            <FormatToken
              amount={balances[token]}
              symbol={TOKEN_SYMBOLS[token]}
              data-testid={'amountToUpgrade'}
            />
          </UpgradeAssetsAmount>
          <UpgradeAssetsButton
            color="primary"
            size="xs"
            variant="translucent"
            onClick={() =>
              upgrade({
                token,
              })
            }
            loading={isUpgrading}
            data-testid={'upgradeButton'}
          >
            Upgrade
          </UpgradeAssetsButton>
        </UpgradeAssetsRow>
      ))}
    </UpgradeAssets>
  );
};
