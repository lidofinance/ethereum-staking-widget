import { useCallback } from 'react';
import { encodeFunctionData, WalletClient } from 'viem';
import { useDappStatus, useLidoSDK, useTxFlow } from 'modules/web3';
import invariant from 'tiny-invariant';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { getSTGDepositQueueWritableContract } from '../../contracts';
import { useTxModalStagesSTGDepositCancel } from './use-stg-deposit-cancel-tx-modal';
import { STG_DEPOSIT_TOKENS } from '../form-context/types';
import { useSTGDepositFormData } from './use-stg-deposit-form-data';

export const useSTGDepositCancel = (onRetry?: () => void) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesSTGDepositCancel();
  const { refetchData } = useSTGDepositFormData();
  const txFlow = useTxFlow();

  const cancel = useCallback(
    async (amount: bigint, token: STG_DEPOSIT_TOKENS) => {
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
          onSign: () => {
            txModalStages.sign(amount, token);
          },
          onReceipt: ({ txHashOrCallId, isAA }) => {
            txModalStages.pending(amount, token, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            txModalStages.success(amount, token, txHash);
            trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyDepositCancel);
            await refetchData(token);
          },
        });

        return true;
      } catch (error) {
        console.error(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [address, core, onRetry, refetchData, txFlow, txModalStages],
  );

  return { cancel };
};
