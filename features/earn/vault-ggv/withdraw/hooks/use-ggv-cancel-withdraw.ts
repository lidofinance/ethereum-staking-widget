import invariant from 'tiny-invariant';
import { useCallback, useState } from 'react';
import { encodeFunctionData, type WalletClient } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

import { AACall, useDappStatus, useLidoSDK, useTxFlow } from 'modules/web3';

import { getGGVQueueWritableContract } from '../../contracts';
import { useGGVPosition } from '../../hooks/use-ggv-position';
import { useTxModalStagesGGVWithdrawalCancel } from './use-ggv-withdraw-cancel-modal';

import type { GGVWithdrawalRequest } from '../types';

export const useGGVCancelWithdraw = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const positionQuery = useGGVPosition();

  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesGGVWithdrawalCancel();
  const txFlow = useTxFlow();

  const cancelGGVWithdraw = useCallback(
    async (request: GGVWithdrawalRequest) => {
      invariant(address, 'needs address');
      setIsLoading(true);
      try {
        const queue = getGGVQueueWritableContract(
          core.rpcProvider,
          core.web3Provider as WalletClient,
        );

        const { amountOfShares, amountOfAssets } = request.metadata;

        // used to display in modal
        const willReceive = amountOfShares;

        const cancelArgs = [{ ...request.metadata }] as const;

        await txFlow({
          callsFn: async () => {
            const calls: AACall[] = [];
            calls.push({
              to: queue.address,
              data: encodeFunctionData({
                abi: queue.abi,
                functionName: 'cancelOnChainWithdraw',
                args: cancelArgs,
              }),
            });

            return calls;
          },
          sendTransaction: async (txStagesCallback) => {
            await core.performTransaction({
              getGasLimit: (opts) =>
                queue.estimateGas.cancelOnChainWithdraw(cancelArgs, opts),
              sendTransaction: (opts) =>
                queue.write.cancelOnChainWithdraw(cancelArgs, opts),
              callback: txStagesCallback,
            });
          },
          onSign: async () => {
            return txModalStages.sign(amountOfAssets, willReceive);
          },
          onReceipt: async ({ txHashOrCallId, isAA }) => {
            return txModalStages.pending(
              amountOfAssets,
              willReceive,
              txHashOrCallId,
              isAA,
            );
          },
          onSuccess: async ({ txHash }) => {
            const opts = {
              cancelRefetch: true,
              throwOnError: false,
            };
            const [newBalance] = await Promise.all([
              positionQuery.refetch(opts),
              queryClient.refetchQueries({ queryKey: ['ggv'] }, opts),
            ]);
            return txModalStages.success(
              newBalance.data?.sharesBalance as bigint,
              txHash,
            );
          },
          onMultisigDone: () => {
            txModalStages.successMultisig();
          },
        });

        const opts = {
          cancelRefetch: true,
          throwOnError: false,
        };

        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['ggv'] }, opts),
          positionQuery.refetch(opts),
        ]);
      } catch (error) {
        console.error(error);
        txModalStages.failed(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [address, core, positionQuery, queryClient, txFlow, txModalStages],
  );

  return { cancelGGVWithdraw, isLoading };
};
