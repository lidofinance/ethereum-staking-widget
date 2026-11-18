import { useMemo } from 'react';
import invariant from 'tiny-invariant';

import {
  getVaultRefetchScope,
  useDeposit,
  useTxModalStagesDeposit,
  type VaultQuote,
} from 'modules/mellow-meta-vaults';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { TOKENS } from 'consts/tokens';
import {
  getAsyncDepositQueueWritableContract,
  getCollectorContract,
  getSyncDepositQueueWritableContract,
} from '../../contracts';
import { USD_VAULT_QUERY_SCOPE, USD_VAULT_TOKEN_SYMBOL } from '../../consts';
import type { UsdDepositToken } from '../../types';
import type { TxRetryHandler } from 'shared/transaction-modal';

type SyncDepositQueueGetterArgs = Parameters<
  typeof getSyncDepositQueueWritableContract
>[0];

// USDe has no sync queue: its deposits always go to the async one
const getSyncDepositQueue = (args: SyncDepositQueueGetterArgs) =>
  args.token === TOKENS.usde
    ? undefined
    : getSyncDepositQueueWritableContract(args);

type UseUsdVaultDepositArgs = {
  onRetry?: TxRetryHandler;
  // the quote the form displays and its refetch: the deposit is held to it
  shownQuote: VaultQuote | undefined;
  refetchQuote: (() => unknown) | undefined;
};

export const useUsdVaultDeposit = ({
  onRetry,
  shownQuote,
  refetchQuote,
}: UseUsdVaultDepositArgs) => {
  const { txModalStages } = useTxModalStagesDeposit({
    stageOperationArgs: {
      willReceiveToken: USD_VAULT_TOKEN_SYMBOL,
      operationText: 'Requesting deposit for',
    },
    stageApproveArgs: {
      willReceiveToken: USD_VAULT_TOKEN_SYMBOL,
      operationText: 'Unlocking',
    },
  });
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const collector = useMemo(
    () => getCollectorContract(publicClientMainnet),
    [publicClientMainnet],
  );

  return useDeposit<UsdDepositToken>({
    syncDepositQueueGetter: getSyncDepositQueue,
    asyncDepositQueueGetter: getAsyncDepositQueueWritableContract,
    collector,
    shownQuote,
    refetchQuote,
    txModalStages,
    onRetry,
    matomoEventStart: MATOMO_EARN_EVENTS_TYPES.earnUsdDepositingStart,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnUsdDepositingFinish,
    refetchScope: getVaultRefetchScope(USD_VAULT_QUERY_SCOPE),
  });
};
