import { useCallback, useState } from 'react';
import invariant from 'tiny-invariant';
import { encodeFunctionData } from 'viem';

import {
  applyRoundUpTxParameter,
  useDappStatus,
  useLidoSDK,
  useTxFlow,
} from 'modules/web3';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { TxModalStages } from '../types/tx-modal-stages';
import { RedeemQueueWritableContract } from '../types/contracts';

export const useWithdrawClaim = <WithdrawToken extends string>({
  redeemQueue,
  token,
  txModalStages,
  onRetry,
  refetchTokenBalance,
  matomoEventStart,
  matomoEventSuccess,
}: {
  redeemQueue: RedeemQueueWritableContract;
  token: WithdrawToken;
  txModalStages: TxModalStages;
  refetchTokenBalance: (token: WithdrawToken) => unknown;
  onRetry?: () => void;
  matomoEventStart?: MATOMO_EVENT_TYPE;
  matomoEventSuccess?: MATOMO_EVENT_TYPE;
}) => {
  const { core } = useLidoSDK();
  const { address } = useDappStatus();
  const txFlow = useTxFlow();

  const [isClaiming, setIsClaiming] = useState(false);

  const withdrawClaim = useCallback(
    async ({ amount, timestamp }: { amount: bigint; timestamp: number }) => {
      if (matomoEventStart) trackMatomoEvent(matomoEventStart);
      invariant(address, 'No address provided');

      try {
        setIsClaiming(true);

        const claimArgs = [address, [timestamp]] as const;

        await txFlow({
          callsFn: async () => [
            {
              to: redeemQueue.address,
              data: encodeFunctionData({
                abi: redeemQueue.abi,
                functionName: 'claim',
                args: claimArgs,
              }),
            },
          ],
          sendTransaction: async (txStagesCallback) => {
            await core.performTransaction({
              getGasLimit: async (opts) =>
                applyRoundUpTxParameter(
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
            await refetchTokenBalance(token);
            if (matomoEventSuccess) trackMatomoEvent(matomoEventSuccess);
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
      matomoEventStart,
      matomoEventSuccess,
      onRetry,
      redeemQueue.abi,
      redeemQueue.address,
      redeemQueue.estimateGas,
      redeemQueue.write,
      refetchTokenBalance,
      token,
      txFlow,
      txModalStages,
    ],
  );

  return { withdrawClaim, isClaiming };
};
