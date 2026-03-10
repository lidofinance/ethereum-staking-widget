import { WalletClient } from 'viem';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useLidoSDK } from 'modules/web3';
import { useWithdraw } from 'modules/mellow-meta-vaults/hooks/use-withdraw';
import { useTxModalStagesWithdraw } from 'modules/mellow-meta-vaults/hooks/use-withdraw-tx-modal';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { TOKENS } from 'consts/tokens';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import {
  getCollectorContract,
  getRedeemQueueWritableContractWSTETH,
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
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  const collector = useMemo(
    () => getCollectorContract(publicClient),
    [publicClient],
  );
  const redeemQueue = useMemo(
    () =>
      getRedeemQueueWritableContractWSTETH(
        publicClient,
        core.web3Provider as WalletClient,
      ),
    [publicClient, core.web3Provider],
  );

  return useWithdraw({
    collector,
    redeemQueue,
    txModalStages,
    onRetry,
    matomoEventStart: MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalStart,
    matomoEventSuccess: MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalFinish,
  });
};
