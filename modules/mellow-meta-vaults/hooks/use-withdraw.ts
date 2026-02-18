import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import {
  useTxFlow,
  useLidoSDK,
  useDappStatus,
  AACall,
  applyRoundUpGasLimit,
} from 'modules/web3';
import { WithdrawParams } from './use-preview-withdraw';
import { COLLECTOR_CONFIG } from '../consts';
import {
  CollectorContract,
  RedeemQueueWritableContract,
} from '../types/contracts';
import { TxModalStages } from '../types/tx-modal-stages';

export const useWithdraw = ({
  redeemQueue,
  collector,
  txModalStages,
  onRetry,
}: {
  redeemQueue: RedeemQueueWritableContract;
  collector: CollectorContract;
  txModalStages: TxModalStages;
  onRetry?: () => void;
}) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const txFlow = useTxFlow();
  const publicClient = usePublicClient();

  const withdraw = useCallback(
    async ({ amount }: { amount: bigint }): Promise<boolean> => {
      // trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyWithdrawalStart); // TODO: add matomo event
      invariant(address, 'needs address');
      invariant(publicClient, 'Public client is not available');

      try {
        const { assets: amountWstETH } =
          (await collector.read.getWithdrawalParams([
            amount,
            redeemQueue.address,
            COLLECTOR_CONFIG,
          ])) as WithdrawParams;

        const withdrawArgs = [amount] as const;

        await txFlow({
          callsFn: async () => {
            const calls: AACall[] = [];
            calls.push({
              to: redeemQueue.address,
              data: encodeFunctionData({
                abi: redeemQueue.abi,
                functionName: 'redeem',
                args: withdrawArgs,
              }),
            });
            return calls;
          },
          sendTransaction: async (txStagesCallback) => {
            await core.performTransaction({
              getGasLimit: async (opts) =>
                applyRoundUpGasLimit(
                  await redeemQueue.estimateGas.redeem(withdrawArgs, {
                    ...opts,
                  }),
                ),
              sendTransaction: (opts) => {
                return redeemQueue.write.redeem(withdrawArgs, {
                  ...opts,
                });
              },
              callback: txStagesCallback,
            });
          },
          onSign: async () => {
            return txModalStages.sign(amountWstETH);
          },
          onReceipt: async ({ txHashOrCallId, isAA }) => {
            return txModalStages.pending(amountWstETH, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            txModalStages.success(amountWstETH, txHash);
            // trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyWithdrawalFinish); // TODO: add matomo event
          },
          onMultisigDone: () => {
            txModalStages.successMultisig();
          },
        });

        return true;
      } catch (error) {
        console.error(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      address,
      collector.read,
      core,
      onRetry,
      publicClient,
      redeemQueue.abi,
      redeemQueue.address,
      redeemQueue.estimateGas,
      redeemQueue.write,
      txFlow,
      txModalStages,
    ],
  );

  return {
    withdraw,
  };
};
