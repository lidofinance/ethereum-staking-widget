import { WalletClient } from 'viem';
import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useLidoSDK, useMainnetOnlyWagmi } from 'modules/web3';
import { useWithdraw } from 'modules/mellow-meta-vaults/hooks/use-withdraw';
import { useTxModalStagesWithdraw } from 'modules/mellow-meta-vaults/hooks/use-withdraw-tx-modal';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { TOKENS } from 'consts/tokens';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import {
  getCollectorContract,
  getRedeemQueueWritableContractWSTETH,
  getSyncRedeemQueueWritableContractWSTETH,
} from '../../contracts';
import { useEthVaultAvailable } from '../../hooks/use-vault-available';
import { useEthVaultSyncRedeemReport } from '../../hooks/use-sync-redeem-report';

export const useEthVaultWithdraw = (onRetry: () => void) => {
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesWithdraw({
    stageOperationArgs: {
      willReceiveToken: getTokenSymbol(TOKENS.earneth),
      token: getTokenSymbol(TOKENS.earneth),
      operationText: 'requesting withdrawal for',
    },
  });
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');
  const { isEthVaultAvailable } = useEthVaultAvailable();
  // The sync queue reverts on a stale, suspicious or zero oracle report
  // while the async queue takes the request regardless:
  // the instant route is withheld until the report is usable again. Unknown
  // (loading, unreadable) leaves the route to the pre-send availability check
  const { isUsable: isSyncRedeemReportUsable } = useEthVaultSyncRedeemReport({
    enabled: isEthVaultAvailable,
  });

  const collector = useMemo(
    () => getCollectorContract(publicClientMainnet),
    [publicClientMainnet],
  );

  const asyncRedeemQueue = useMemo(() => {
    return getRedeemQueueWritableContractWSTETH(
      publicClientMainnet,
      core.walletClient as WalletClient,
    );
  }, [publicClientMainnet, core.walletClient]);

  const syncRedeemQueue = useMemo(() => {
    return getSyncRedeemQueueWritableContractWSTETH(
      publicClientMainnet,
      core.walletClient as WalletClient,
    );
  }, [publicClientMainnet, core.walletClient]);

  return useWithdraw({
    collector,
    asyncRedeemQueue,
    syncRedeemQueue:
      isSyncRedeemReportUsable === false ? undefined : syncRedeemQueue,
    txModalStages,
    onRetry,
    matomoEventStart: MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalStart,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalFinish,
  });
};
