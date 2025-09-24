import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { encodeFunctionData, WalletClient } from 'viem';

import {
  applyRoundUpGasLimit,
  useDappStatus,
  useLidoSDK,
  useTxFlow,
} from 'modules/web3';
import { getSTGRedeemQueueWritableContractWSTETH } from '../../contracts';
import { useTxModalStagesSTGWithdrawClaim } from './use-stg-withdraw-claim-tx-modal';

export const useSTGWithdrawClaim = (onRetry?: () => void) => {
  const { core } = useLidoSDK();
  const { address } = useDappStatus();
  const { txModalStages } = useTxModalStagesSTGWithdrawClaim();
  const txFlow = useTxFlow();

  const withdrawClaim = useCallback(
    async ({ amount, timestamp }: { amount: bigint; timestamp: number }) => {
      invariant(address, 'No address provided');

      try {
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
          onSign: async () => {
            return txModalStages.sign(amount);
          },
        });
        return true;
      } catch (error) {
        console.error(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [address, core, onRetry, txFlow, txModalStages],
  );

  return { withdrawClaim };
};
