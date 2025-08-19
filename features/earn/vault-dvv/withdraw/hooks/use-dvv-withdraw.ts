import invariant from 'tiny-invariant';
import { useCallback } from 'react';
import { encodeFunctionData, WalletClient } from 'viem';

import { AACall, useDappStatus, useLidoSDK, useTxFlow } from 'modules/web3';
import { useTxModalStagesDVVWithdraw } from './use-dvv-withdraw-tx-modal';
import { getDVVaultWritableContract } from '../../contracts';

export const useDVVWithdraw = (onRetry?: () => void) => {
  const { address } = useDappStatus();
  const { core, wstETH } = useLidoSDK();
  const { txModalStages } = useTxModalStagesDVVWithdraw();
  const txFlow = useTxFlow();

  const withdrawDVV = useCallback(
    async ({ amount }: { amount: bigint }) => {
      invariant(address, 'the address is required');

      try {
        const vault = getDVVaultWritableContract(
          core.rpcProvider,
          core.web3Provider as WalletClient,
        );

        // used to display in modal
        const willReceiveWstETH = await vault.read.previewRedeem([amount]);

        // determines:
        // - if approve tx/call to be used, after approve tx(or if included in AA call) set to false
        // - if to show approve or main tx modals
        let needsApprove = false;

        const allowance = await vault.read.allowance([address, vault.address]);

        needsApprove = allowance < amount;

        const approveArgs = [vault.address, amount] as const; // spender, value
        const withdrawArgs = [amount, address, address] as const; // shares, receiver, owner

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
              to: vault.address,
              data: encodeFunctionData({
                abi: vault.abi,
                functionName: 'redeem',
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
                vault.estimateGas.redeem(withdrawArgs, opts),
              sendTransaction: (opts) => vault.write.redeem(withdrawArgs, opts),
              callback: txStagesCallback,
            });
          },
          onSign: async () => {
            if (needsApprove) {
              return txModalStages.signApproval(amount);
            }
            return txModalStages.sign(amount, willReceiveWstETH);
          },
          onReceipt: async ({ txHashOrCallId, isAA }) => {
            if (needsApprove) {
              return txModalStages.pendingApproval(amount, txHashOrCallId);
            }
            return txModalStages.pending(
              amount,
              willReceiveWstETH,
              txHashOrCallId,
              isAA,
            );
          },
          onSuccess: async ({ txHash }) => {
            if (needsApprove) return;
            const wstETHBalance = await wstETH.balance(address);
            txModalStages.success(wstETHBalance, txHash);
          },
          onMultisigDone: () => {
            if (needsApprove) return;
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

  return {
    withdrawDVV,
  };
};
