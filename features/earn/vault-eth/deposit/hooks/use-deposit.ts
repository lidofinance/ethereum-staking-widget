import { useCallback, useMemo } from 'react';
import invariant from 'tiny-invariant';

import {
  getVaultRefetchScope,
  useDeposit,
  useTxModalStagesDeposit,
  type VaultQuote,
} from 'modules/mellow-meta-vaults';
import { useMainnetOnlyWagmi } from 'modules/web3';
import {
  getCollectorContract,
  getLegacyAsyncDepositQueueWritableContract,
  getSyncDepositQueueWritableContract,
} from '../../contracts';
import { ETH_VAULT_QUERY_SCOPE, ETH_VAULT_TOKEN_SYMBOL } from '../../consts';
import type { EthDepositToken } from '../../types';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { TOKENS } from 'consts/tokens';
import { useEthVaultDepositSteth } from './use-deposit-steth';

type UseEthVaultDepositArgs = {
  onRetry?: () => void;
  // The quote the form displays for the selected token and its refetch: the
  // deposit is held to it. Omitted where no quote is displayed
  shownQuote?: VaultQuote;
  refetchQuote?: () => unknown;
};

type EthVaultDepositArgs = {
  amount: bigint;
  token: EthDepositToken;
  referral: string | null;
};

export const useEthVaultDeposit = ({
  onRetry,
  shownQuote,
  refetchQuote,
}: UseEthVaultDepositArgs = {}) => {
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
    syncDepositQueueGetter: getSyncDepositQueueWritableContract,
    asyncDepositQueueGetter: getLegacyAsyncDepositQueueWritableContract,
    collector,
    shownQuote,
    refetchQuote,
    txModalStages,
    onRetry,
    matomoEventStart: MATOMO_EARN_EVENTS_TYPES.earnEthDepositingStart,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnEthDepositingFinish,
    refetchScope: getVaultRefetchScope(ETH_VAULT_QUERY_SCOPE),
  });

  const { deposit: depositSteth } = useEthVaultDepositSteth({
    collector,
    shownQuote,
    refetchQuote,
    txModalStages,
    onRetry,
  });

  const deposit = useCallback(
    async ({ amount, token, referral }: EthVaultDepositArgs) => {
      if (token === TOKENS.steth) {
        return depositSteth({ amount, referral });
      }
      return depositNormal({ amount, token, referral });
    },
    [depositNormal, depositSteth],
  );

  return { deposit };
};
