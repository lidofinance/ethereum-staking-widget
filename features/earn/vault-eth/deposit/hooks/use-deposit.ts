import { useCallback, useMemo } from 'react';
import invariant from 'tiny-invariant';

import { useMainnetOnlyWagmi } from 'modules/web3';
import { useDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit';
import { useTxModalStagesDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit-tx-modal';
import {
  getCollectorContract,
  getSyncDepositQueueWritableContract,
} from '../../contracts';
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

  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');
  const collector = useMemo(
    () => getCollectorContract(publicClientMainnet),
    [publicClientMainnet],
  );

  const { deposit: depositNormal } = useDeposit<EthDepositToken>({
    depositQueueGetter: getSyncDepositQueueWritableContract,
    collector,
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
