import { useCallback } from 'react';
import { encodeFunctionData, WalletClient } from 'viem';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';

import type { STGWithdrawFormValidatedValues } from '../form-context/types';

import {
  useTxFlow,
  useLidoSDK,
  useDappStatus,
  AACall,
  applyRoundUpGasLimit,
} from 'modules/web3';
import { useTxModalStagesSTGWithdraw } from './use-stg-withdraw-tx-modal';
import { getSTGRedeemQueueWritableContractWSTETH } from '../../contracts';
import { getWithdrawalParams } from '../utils';

export const useSTGWithdraw = (onRetry: () => void) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesSTGWithdraw();
  const txFlow = useTxFlow();
  const publicClient = usePublicClient();

  const withdrawSTG = useCallback(
    async ({ amount }: STGWithdrawFormValidatedValues): Promise<boolean> => {
      // trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.stgWithdrawStart);
      invariant(address, 'needs address');
      invariant(publicClient, 'Public client is not available');

      try {
        const redeemQueueContract = getSTGRedeemQueueWritableContractWSTETH(
          core.rpcProvider,
          core.web3Provider as WalletClient,
        );

        const { assets: amountWstETH } = await getWithdrawalParams({
          shares: amount,
          publicClient,
        });

        const withdrawArgs = [amount] as const;

        await txFlow({
          callsFn: async () => {
            const calls: AACall[] = [];
            calls.push({
              to: redeemQueueContract.address,
              data: encodeFunctionData({
                abi: redeemQueueContract.abi,
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
                  await redeemQueueContract.estimateGas.redeem(withdrawArgs, {
                    ...opts,
                  }),
                ),
              sendTransaction: (opts) => {
                return redeemQueueContract.write.redeem(withdrawArgs, {
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
            // trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.stgWithdrawFinish);
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
    [address, core, onRetry, publicClient, txFlow, txModalStages],
  );

  return {
    withdrawSTG,
  };
};
