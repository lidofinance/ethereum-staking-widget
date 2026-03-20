import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { useDappStatus } from 'modules/web3';
import { TOKENS, TOKEN_SYMBOLS } from 'consts/tokens';
import { TokenGGIcon, TokenDvstethIcon, TokenStrethIcon } from 'assets/earn-v2';
import { FormatToken } from 'shared/formatters/format-token';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MELLOW_VAULTS_QUERY_SCOPE } from 'modules/mellow-meta-vaults/consts';
import { overrideWithQAMockBigInt } from 'utils/qa';

import {
  UpgradeAssets,
  UpgradeAssetsTitle,
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
import { useEthVaultDeposit } from '../deposit/hooks';
import { EthDepositTokenUpgradable } from '../types';
import { ETHDepositFormValues } from '../deposit/form-context/types';

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
  amount: bigint;
  token: EthDepositTokenUpgradable;
};

export const UpgradeAssetsBlock = () => {
  const { isWalletConnected } = useDappStatus();
  const queryClient = useQueryClient();
  const { balances, refetchBalances } = useUpgradableTokenBalances();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const { watch } = useFormContext<ETHDepositFormValues>();
  const referral = watch('referral');

  const { deposit } = useEthVaultDeposit();

  const upgrade = useCallback(
    async ({
      // TODO: consider getting amount inside upgrade function
      amount,
      token,
    }: UpgradeArgs) => {
      const depositAmount = overrideWithQAMockBigInt(
        amount ?? 0n,
        'mock-qa-helpers-earn-eth-upgrade-amount',
      );

      if (!depositAmount) return;
      setIsUpgrading(true);

      try {
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
      <UpgradeAssetsTitle>Assets available to upgrade</UpgradeAssetsTitle>
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
                amount: balances[token] as bigint,
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
