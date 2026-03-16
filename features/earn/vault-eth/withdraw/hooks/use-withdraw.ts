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
  const redeemQueue = useMemo(
    () =>
      getRedeemQueueWritableContractWSTETH(
        publicClientMainnet,
        core.web3Provider as WalletClient,
      ),
    [publicClientMainnet, core.web3Provider],
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
