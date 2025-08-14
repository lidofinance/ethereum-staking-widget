import { useCallback } from 'react';
import { useDappStatus, useTxFlow, AACall, useLidoSDK } from 'modules/web3';
import { GGVWithdrawalFormValidatedValues } from '../types';
import { encodeFunctionData, maxUint24, WalletClient } from 'viem';
import invariant from 'tiny-invariant';
import {
  getGGVQueueWritableContract,
  getGGVVaultWritableContract,
} from '../../contracts';
import { useTxModalStagesGGVWithdrawalRequest } from './use-ggv-withdraw-request-modal';

export const useGGVWithdraw = (onRetry?: () => void) => {
  const { address } = useDappStatus();
  const { core, wstETH } = useLidoSDK();
  const { txModalStages } = useTxModalStagesGGVWithdrawalRequest();
  const txFlow = useTxFlow();

  const withdrawGGV = useCallback(
    async ({ amount }: GGVWithdrawalFormValidatedValues) => {
      invariant(address, 'needs address');

      try {
        const wstethAddress = await wstETH.contractAddress();
        const vault = getGGVVaultWritableContract(
          core.rpcProvider,
          core.web3Provider as WalletClient,
        );

        const queue = getGGVQueueWritableContract(
          core.rpcProvider,
          core.web3Provider as WalletClient,
        );

        const minDiscount = (
          await queue.read.withdrawAssets([wstethAddress])
        )[3];

        // used to display in modal
        const willReceive = await queue.read.previewAssetsOut([
          wstethAddress,
          amount,
          minDiscount,
        ]);

        // determines:
        // - if approve tx/call to be used, after approve tx(or if included in AA call) set to false
        // - if to show approve or main tx modals
        let needsApprove = false;

        const allowance = await vault.read.allowance([address, queue.address]);

        needsApprove = allowance < amount;

        // approve amount of GG to withdrawal queue
        const approveArgs = [queue.address, amount] as const;

        const withdrawArgs = [
          wstethAddress,
          amount,
          minDiscount,
          // maximum request deadline
          Number(maxUint24),
        ] as const;

        await txFlow({
          callsFn: async () => {
            const calls: AACall[] = [];
            if (needsApprove) {
              calls.push({
                to: vault.address,
                data: encodeFunctionData({
                  abi: vault.abi,
                  functionName: 'approve',
                  args: approveArgs,
                }),
              });
            }
            calls.push({
              to: queue.address,
              data: encodeFunctionData({
                abi: queue.abi,
                functionName: 'requestOnChainWithdraw',
                args: withdrawArgs,
              }),
            });

            needsApprove = false;

            return calls;
          },
          sendTransaction: async (txStagesCallback) => {
            if (needsApprove) {
              await core.performTransaction({
                getGasLimit: (opts) =>
                  vault.estimateGas.approve(approveArgs, opts),
                sendTransaction: (opts) =>
                  vault.write.approve(approveArgs, opts),
                callback: txStagesCallback,
              });
            }
            needsApprove = false;
            await core.performTransaction({
              getGasLimit: (opts) =>
                queue.estimateGas.requestOnChainWithdraw(withdrawArgs, opts),
              sendTransaction: (opts) =>
                queue.write.requestOnChainWithdraw(withdrawArgs, opts),
              callback: txStagesCallback,
            });
          },
          onSign: async () => {
            if (needsApprove) {
              return txModalStages.signApproval(amount);
            }
            return txModalStages.sign(amount, willReceive);
          },
          onReceipt: async ({ payload }) => {
            if (needsApprove) {
              return txModalStages.pendingApproval(amount, payload);
            }
            return txModalStages.pending(amount, willReceive, payload);
          },
          onSuccess: async ({ txHash }) => {
            const balance = await wstETH.balance(address);
            txModalStages.success(balance, txHash);
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
    [address, core, onRetry, txFlow, txModalStages, wstETH],
  );

  return { withdrawGGV };
};
