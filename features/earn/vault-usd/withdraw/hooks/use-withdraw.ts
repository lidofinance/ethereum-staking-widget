import { WalletClient } from 'viem';
import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useLidoSDK, useMainnetOnlyWagmi } from 'modules/web3';
import { useWithdraw } from 'modules/mellow-meta-vaults/hooks/use-withdraw';
import { useTxModalStagesWithdraw } from 'modules/mellow-meta-vaults/hooks/use-withdraw-tx-modal';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { TOKENS } from 'consts/tokens';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import {
  getCollectorContract,
  getRedeemQueueWritableContract,
  getSyncRedeemQueueWritableContract,
} from '../../contracts';
import type { UsdWithdrawToken } from '../../types';

export const useUsdVaultWithdraw = (
  onRetry: () => void,
  token: UsdWithdrawToken,
) => {
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
    txModalStages,
    onRetry,
    matomoEventStart: MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalStart,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalFinish,
  });
};
