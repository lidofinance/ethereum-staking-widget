import { useCallback } from 'react';
import { encodeFunctionData, WalletClient } from 'viem';
import { useDappStatus, useLidoSDK, useTxFlow } from 'modules/web3';
import invariant from 'tiny-invariant';
import { getSTGVaultWritableContract } from '../../contracts';
import { useTxModalStagesSTGDepositClaim } from './use-stg-deposit-claim-tx-modal';

export const useSTGDepositClaim = (onRetry?: () => void) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesSTGDepositClaim();
  const txFlow = useTxFlow();

  const claim = useCallback(async () => {
    invariant(address, 'Address is not available');

    const vault = getSTGVaultWritableContract(
      core.rpcProvider,
      core.web3Provider as WalletClient,
    );

    const claimArgs = [address] as const;

    try {
      await txFlow({
        callsFn: async () => [
          {
            to: vault.address,
            data: encodeFunctionData({
              abi: vault.abi,
              functionName: 'claimShares',
              args: claimArgs,
            }),
          },
        ],
        sendTransaction: async (txStagesCallback) => {
          await core.performTransaction({
            getGasLimit: async (opts) =>
              await vault.estimateGas.claimShares(claimArgs, {
                ...opts,
              }),
            sendTransaction: (opts) => {
              return vault.write.claimShares(claimArgs, {
                ...opts,
              });
            },
            callback: txStagesCallback,
          });
        },
      });

      return true;
    } catch (error) {
      console.error(error);
      txModalStages.failed(error, onRetry);
      return false;
    }
  }, [address, core, onRetry, txFlow, txModalStages]);

  return { claim };
};
