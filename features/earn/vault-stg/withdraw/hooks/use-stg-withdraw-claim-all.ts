import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { encodeFunctionData, WalletClient } from 'viem';

import {
  applyRoundUpGasLimit,
  useDappStatus,
  useLidoSDK,
  useTxFlow,
} from 'modules/web3';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { getSTGRedeemQueueWritableContractWSTETH } from '../../contracts';
import { useTxModalStagesSTGWithdrawClaim } from './use-stg-withdraw-claim-tx-modal';
import { useSTGWithdrawRequests } from './use-stg-withdraw-requests';
import { useSTGDepositFormData } from '../../deposit/hooks';

export const useSTGWithdrawClaimAll = (onRetry?: () => void) => {
  const { core } = useLidoSDK();
  const { address } = useDappStatus();
  const { txModalStages } = useTxModalStagesSTGWithdrawClaim();
  const { refetchData } = useSTGDepositFormData();
  const { data } = useSTGWithdrawRequests();
  const txFlow = useTxFlow();

  const claimableRequests = data?.claimableRequests || [];
  const totalClaimableAmount = claimableRequests.reduce(
    (acc, request) => acc + request.assets,
    0n,
  );
  const timestamps = claimableRequests.map((request) =>
    Number(request.timestamp),
  );

  const withdrawClaimAll = useCallback(async () => {
    invariant(address, 'No address provided');

    try {
      const redeemQueueContract = getSTGRedeemQueueWritableContractWSTETH(
        core.rpcProvider,
        core.web3Provider as WalletClient,
      );

      const claimArgs = [address, timestamps] as const;

      await txFlow({
        callsFn: async () => [
          {
            to: redeemQueueContract.address,
            data: encodeFunctionData({
              abi: redeemQueueContract.abi,
              functionName: 'claim',
              args: claimArgs,
            }),
          },
        ],
        sendTransaction: async (txStagesCallback) => {
          await core.performTransaction({
            getGasLimit: async (opts) =>
              applyRoundUpGasLimit(
                await redeemQueueContract.estimateGas.claim(claimArgs, {
                  ...opts,
                }),
              ),
            sendTransaction: (opts) => {
              return redeemQueueContract.write.claim(claimArgs, {
                ...opts,
              });
            },
            callback: txStagesCallback,
          });
        },
        onSign: async () => {
          txModalStages.sign(totalClaimableAmount);
        },
        onReceipt: async ({ txHashOrCallId, isAA }) => {
          txModalStages.pending(totalClaimableAmount, txHashOrCallId, isAA);
        },
        onSuccess: async ({ txHash }) => {
          trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyWithdrawalClaimAll);
          txModalStages.success(totalClaimableAmount, txHash);
          await refetchData('wstETH');
        },
      });
      return true;
    } catch (error) {
      console.error(error);
      txModalStages.failed(error, onRetry);
      return false;
    }
  }, [
    address,
    core,
    onRetry,
    refetchData,
    timestamps,
    totalClaimableAmount,
    txFlow,
    txModalStages,
  ]);

  return { withdrawClaimAll };
};
