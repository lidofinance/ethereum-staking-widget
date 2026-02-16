import { useCallback, useState } from 'react';
import invariant from 'tiny-invariant';
import { encodeFunctionData } from 'viem';

import {
  applyRoundUpGasLimit,
  useDappStatus,
  useLidoSDK,
  useTxFlow,
} from 'modules/web3';
import { TxModalStages } from '../types/tx-modal-stages';
import { RedeemQueueWritableContract } from '../types/contracts';

export const useWithdrawClaim = <WithdrawToken extends string>({
  redeemQueue,
  token,
  txModalStages,
  onRetry,
  refetchTokenBalance,
}: {
  redeemQueue: RedeemQueueWritableContract;
  token: WithdrawToken;
  txModalStages: TxModalStages;
  refetchTokenBalance: (token: WithdrawToken) => unknown;
  onRetry?: () => void;
}) => {
  const { core } = useLidoSDK();
  const { address } = useDappStatus();
  const txFlow = useTxFlow();

  const [isClaiming, setIsClaiming] = useState(false);

  const withdrawClaim = useCallback(
    async ({ amount, timestamp }: { amount: bigint; timestamp: number }) => {
      invariant(address, 'No address provided');

      try {
        setIsClaiming(true);

        const { address, abi } = redeemQueue;

        const claimArgs = [address, [timestamp]] as const;

        await txFlow({
          callsFn: async () => [
            {
              to: address,
              data: encodeFunctionData({
                abi,
                functionName: 'claim',
                args: claimArgs,
              }),
            },
          ],
          sendTransaction: async (txStagesCallback) => {
            await core.performTransaction({
              getGasLimit: async (opts) =>
                applyRoundUpGasLimit(
                  await redeemQueue.estimateGas.claim(claimArgs, {
                    ...opts,
                  }),
                ),
              sendTransaction: (opts) => {
                return redeemQueue.write.claim(claimArgs, {
                  ...opts,
                });
              },
              callback: txStagesCallback,
            });
          },
          onSign: () => {
            txModalStages.sign(amount);
          },
          onReceipt: ({ txHashOrCallId, isAA }) => {
            txModalStages.pending(amount, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            txModalStages.success(amount, txHash);
            // trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyWithdrawalClaim); // TODO: add matomo event
            await refetchTokenBalance(token);
          },
        });
        return true;
      } catch (error) {
        console.error(error);
        txModalStages.failed(error, onRetry);
        return false;
      } finally {
        setIsClaiming(false);
      }
    },
    [
      address,
      core,
      onRetry,
      redeemQueue,
      refetchTokenBalance,
      token,
      txFlow,
      txModalStages,
    ],
  );

  return { withdrawClaim, isClaiming };
};
