import { WalletClient } from 'viem';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import { useLidoSDK } from 'modules/web3';
import { useWithdraw } from 'modules/mellow-meta-vaults/hooks/use-withdraw';
import {
  getCollectorContract,
  getRedeemQueueWritableContractWSTETH,
} from '../../contracts';
import { useTxModalStagesWithdraw } from 'modules/mellow-meta-vaults/hooks/use-withdraw-tx-modal';
import { getTokenSymbol } from 'utils/getTokenSymbol';

export const useEthVaultWithdraw = (onRetry: () => void) => {
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesWithdraw({
    stageOperationArgs: {
      willReceiveToken: getTokenSymbol('wsteth'),
      token: getTokenSymbol('wsteth'),
      operationText: 'requesting withdrawal for',
    },
  });
  const publicClient = usePublicClient();
  invariant(publicClient, 'Public client is not available');

  const collector = getCollectorContract(publicClient);
  const redeemQueue = getRedeemQueueWritableContractWSTETH(
    publicClient,
    core.web3Provider as WalletClient,
  );

  return useWithdraw({ collector, redeemQueue, txModalStages, onRetry });
};
