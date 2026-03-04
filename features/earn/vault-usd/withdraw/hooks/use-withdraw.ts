import { WalletClient } from 'viem';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useLidoSDK } from 'modules/web3';
import { useWithdraw } from 'modules/mellow-meta-vaults/hooks/use-withdraw';
import {
  getCollectorContract,
  getRedeemQueueWritableContractUSDC,
} from '../../contracts';
import { useTxModalStagesWithdraw } from 'modules/mellow-meta-vaults/hooks/use-withdraw-tx-modal';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { TOKENS } from 'consts/tokens';

export const useUsdVaultWithdraw = (onRetry: () => void) => {
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesWithdraw({
    stageOperationArgs: {
      willReceiveToken: getTokenSymbol(TOKENS.earnusd),
      token: getTokenSymbol(TOKENS.earnusd),
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
      getRedeemQueueWritableContractUSDC(
        publicClient,
        core.web3Provider as WalletClient,
      ),
    [publicClient, core.web3Provider],
  );

  return useWithdraw({ collector, redeemQueue, txModalStages, onRetry });
};
