import { WalletClient } from 'viem';
import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useLidoSDK, useMainnetOnlyWagmi } from 'modules/web3';
import {
  getVaultRefetchScope,
  useTxModalStagesWithdraw,
  useWithdraw,
  type VaultQuote,
} from 'modules/mellow-meta-vaults';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { TOKENS } from 'consts/tokens';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import {
  getCollectorContract,
  getOracleContract,
  getRedeemQueueWritableContract,
  getSyncRedeemQueueWritableContract,
} from '../../contracts';
import { USD_VAULT_QUERY_SCOPE } from '../../consts';
import type { UsdWithdrawToken } from '../../types';

type UseUsdVaultWithdrawArgs = {
  onRetry: () => void;
  // the payout token, which decides the redeem queues
  token: UsdWithdrawToken;
  // the quote the form displays and its refetch: the withdrawal is held to it
  shownQuote?: VaultQuote;
  refetchQuote?: () => unknown;
};

export const useUsdVaultWithdraw = ({
  onRetry,
  token,
  shownQuote,
  refetchQuote,
}: UseUsdVaultWithdrawArgs) => {
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesWithdraw({
    stageOperationArgs: {
      willReceiveToken: getTokenSymbol(TOKENS.earnusd),
      token: getTokenSymbol(TOKENS.earnusd),
      operationText: 'requesting withdrawal for',
    },
  });
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const collector = useMemo(
    () => getCollectorContract(publicClientMainnet),
    [publicClientMainnet],
  );

  const oracle = useMemo(
    () => getOracleContract(publicClientMainnet),
    [publicClientMainnet],
  );

  const asyncRedeemQueue = useMemo(() => {
    return getRedeemQueueWritableContract({
      publicClient: publicClientMainnet,
      walletClient: core.walletClient as WalletClient,
      token,
    });
  }, [publicClientMainnet, core.walletClient, token]);

  const syncRedeemQueue = useMemo(() => {
    return getSyncRedeemQueueWritableContract({
      publicClient: publicClientMainnet,
      walletClient: core.walletClient as WalletClient,
      token,
    });
  }, [publicClientMainnet, core.walletClient, token]);

  return useWithdraw({
    collector,
    asyncRedeemQueue,
    syncRedeemQueue,
    oracle,
    shownQuote,
    refetchQuote,
    txModalStages,
    onRetry,
    matomoEventStart: MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalStart,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalFinish,
    refetchScope: getVaultRefetchScope(USD_VAULT_QUERY_SCOPE),
  });
};
