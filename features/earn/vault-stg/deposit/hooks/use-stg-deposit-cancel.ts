import { useCallback } from 'react';
import { encodeFunctionData, WalletClient } from 'viem';
import { useDappStatus, useLidoSDK, useTxFlow } from 'modules/web3';
import invariant from 'tiny-invariant';
import { getSTGDepositQueueWritableContract } from '../../contracts';
import { useTxModalStagesSTGDepositCancel } from './use-stg-deposit-cancel-tx-modal';
import { STG_DEPOSIT_TOKENS } from '../form-context/types';

export const useSTGDepositCancel = (onRetry?: () => void) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesSTGDepositCancel();
  const txFlow = useTxFlow();

  const cancel = useCallback(
    async (token: STG_DEPOSIT_TOKENS) => {
      invariant(address, 'Address is not available');

      const depositQueue = getSTGDepositQueueWritableContract({
        publicClient: core.rpcProvider,
        walletClient: core.web3Provider as WalletClient,
        token,
      });

      try {
        await txFlow({
          callsFn: async () => [
            {
              to: depositQueue.address,
              data: encodeFunctionData({
                abi: depositQueue.abi,
                functionName: 'cancelDepositRequest',
              }),
            },
          ],
          sendTransaction: async (txStagesCallback) => {
            await core.performTransaction({
              getGasLimit: async (opts) =>
                await depositQueue.estimateGas.cancelDepositRequest({
                  ...opts,
                }),
              sendTransaction: (opts) => {
                return depositQueue.write.cancelDepositRequest({
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
    },
    [address, core, onRetry, txFlow, txModalStages],
  );

  return { cancel };
};
