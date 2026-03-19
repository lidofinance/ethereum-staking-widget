import { useCallback } from 'react';

import { useDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit';
import { useTxModalStagesDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit-tx-modal';
import { getSyncDepositQueueWritableContract } from '../../contracts';
import { ETH_VAULT_TOKEN_SYMBOL } from '../../consts';
import type { EthDepositToken } from '../../types';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { TOKENS } from 'consts/tokens';
import { useEthVaultDepositSteth } from './use-deposit-steth';

export const useEthVaultDeposit = (onRetry?: () => void) => {
  const { txModalStages } = useTxModalStagesDeposit({
    stageOperationArgs: {
      willReceiveToken: ETH_VAULT_TOKEN_SYMBOL,
      operationText: 'Requesting deposit for',
    },
    stageApproveArgs: {
      willReceiveToken: ETH_VAULT_TOKEN_SYMBOL,
      operationText: 'Unlocking',
    },
  });

  const { deposit: depositNormal } = useDeposit<EthDepositToken>({
    depositQueueGetter: getSyncDepositQueueWritableContract,
    txModalStages,
    onRetry,
    matomoEventStart: MATOMO_EARN_EVENTS_TYPES.earnEthDepositingStart,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnEthDepositingFinish,
  });

  const { deposit: depositSteth } = useEthVaultDepositSteth(onRetry);

  const deposit = useCallback(
    async ({
      amount,
      token,
      referral,
    }: {
      amount: bigint;
      token: EthDepositToken;
      referral: string | null;
    }) => {
      if (token === TOKENS.steth) {
        return depositSteth({ amount, referral });
      }
      return depositNormal({ amount, token, referral });
    },
    [depositNormal, depositSteth],
  );

  return { deposit };
};
