import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import invariant from 'tiny-invariant';

import {
  useTxFlow,
  useLidoSDK,
  useDappStatus,
  AACall,
  applyRoundUpTxParameter,
} from 'modules/web3';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import {
  CollectorContract,
  RedeemQueueWritableContract,
} from '../types/contracts';
import { TxModalStages } from '../types/tx-modal-stages';

export const useWithdraw = ({
  redeemQueue,
  txModalStages,
  onRetry,
  matomoEventStart,
  matomoEventSuccess,
}: {
  redeemQueue: RedeemQueueWritableContract;
  collector: CollectorContract;
  txModalStages: TxModalStages;
  onRetry?: () => void;
  matomoEventStart?: MATOMO_EVENT_TYPE;
  matomoEventSuccess?: MATOMO_EVENT_TYPE;
}) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const txFlow = useTxFlow();

  const withdraw = useCallback(
    async ({ amount }: { amount: bigint }): Promise<boolean> => {
      if (matomoEventStart) trackMatomoEvent(matomoEventStart);
      invariant(address, 'needs address');

      try {
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
                applyRoundUpTxParameter(
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
            return txModalStages.sign(amount);
          },
          onReceipt: async ({ txHashOrCallId, isAA }) => {
            return txModalStages.pending(amount, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            txModalStages.success(amount, txHash);
            if (matomoEventSuccess) trackMatomoEvent(matomoEventSuccess);
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
      core,
      matomoEventStart,
      matomoEventSuccess,
      onRetry,
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
