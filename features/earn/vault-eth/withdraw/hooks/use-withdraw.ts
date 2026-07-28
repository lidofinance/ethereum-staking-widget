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
    syncRedeemQueue,
    txModalStages,
    onRetry,
    matomoEventStart: MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalStart,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalFinish,
  });
};
