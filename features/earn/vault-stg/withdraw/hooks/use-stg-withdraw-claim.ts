import { useCallback, useState } from 'react';
import invariant from 'tiny-invariant';
import { encodeFunctionData, WalletClient } from 'viem';

import {
  applyRoundUpGasLimit,
  useDappStatus,
  useLidoSDK,
  useTxFlow,
} from 'modules/web3';
import { getSTGRedeemQueueWritableContractWSTETH } from '../../contracts';
import { useSTGDepositFormData } from '../../deposit/hooks';
import { useTxModalStagesSTGWithdrawClaim } from './use-stg-withdraw-claim-tx-modal';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

export const useSTGWithdrawClaim = (onRetry?: () => void) => {
  const { core } = useLidoSDK();
  const { address } = useDappStatus();
  const { txModalStages } = useTxModalStagesSTGWithdrawClaim();
  const { refetchData } = useSTGDepositFormData();
  const txFlow = useTxFlow();

  const [isClaiming, setIsClaiming] = useState(false);

  const withdrawClaim = useCallback(
    async ({ amount, timestamp }: { amount: bigint; timestamp: number }) => {
      invariant(address, 'No address provided');

      try {
        setIsClaiming(true);
        const redeemQueueContract = getSTGRedeemQueueWritableContractWSTETH(
          core.rpcProvider,
          core.web3Provider as WalletClient,
        );

        const claimArgs = [address, [timestamp]] as const;

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
          onSign: () => {
            txModalStages.sign(amount);
          },
          onReceipt: ({ txHashOrCallId, isAA }) => {
            txModalStages.pending(amount, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            txModalStages.success(amount, txHash);
            await refetchData('wstETH');
            trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.strategyWithdrawalClaim);
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
    [address, core, onRetry, refetchData, txFlow, txModalStages],
  );

  return { withdrawClaim, isClaiming };
};
