import { useCallback, useMemo, useState } from 'react';
import invariant from 'tiny-invariant';
import { encodeFunctionData } from 'viem';

import {
  applyRoundUpGasLimit,
  useDappStatus,
  useLidoSDK,
  useTxFlow,
} from 'modules/web3';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { TxModalStages } from '../types/tx-modal-stages';
import { RedeemQueueWritableContract } from '../types/contracts';
import { WithdrawRequestData } from '../types/withdraw-request-data';

export const useWithdrawClaimAll = <WithdrawToken extends string>({
  redeemQueue,
  token,
  txModalStages,
  claimableRequests,
  refetchTokenBalance,
  onRetry,
  matomoEventStart,
  matomoEventSuccess,
}: {
  redeemQueue: RedeemQueueWritableContract;
  token: WithdrawToken;
  txModalStages: TxModalStages;
  claimableRequests: WithdrawRequestData[];
  refetchTokenBalance: (token: WithdrawToken) => unknown;
  onRetry?: () => void;
  matomoEventStart?: MATOMO_EVENT_TYPE;
  matomoEventSuccess?: MATOMO_EVENT_TYPE;
}) => {
  const { core } = useLidoSDK();
  const { address } = useDappStatus();
  const txFlow = useTxFlow();

  const [isClaiming, setIsClaiming] = useState(false);

  const totalClaimableAmount = useMemo(
    () => claimableRequests.reduce((acc, request) => acc + request.assets, 0n),
    [claimableRequests],
  );

  const timestamps = useMemo(
    () => claimableRequests.map((request) => Number(request.timestamp)),
    [claimableRequests],
  );

  const withdrawClaimAll = useCallback(async () => {
    invariant(address, 'No address provided');
    if (matomoEventStart) trackMatomoEvent(matomoEventStart);

    try {
      setIsClaiming(true);

      const claimArgs = [address, timestamps] as const;

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
          txModalStages.sign(totalClaimableAmount);
        },
        onReceipt: ({ txHashOrCallId, isAA }) => {
          txModalStages.pending(totalClaimableAmount, txHashOrCallId, isAA);
        },
        onSuccess: async ({ txHash }) => {
          txModalStages.success(totalClaimableAmount, txHash);
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
  }, [
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
    timestamps,
    token,
    totalClaimableAmount,
    txFlow,
    txModalStages,
  ]);

  return { withdrawClaimAll, isClaiming };
};
