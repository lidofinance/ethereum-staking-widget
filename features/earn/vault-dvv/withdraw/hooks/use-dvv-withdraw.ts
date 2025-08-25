import invariant from 'tiny-invariant';
import { useCallback } from 'react';
import { encodeFunctionData, WalletClient } from 'viem';

import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { AACall, useDappStatus, useLidoSDK, useTxFlow } from 'modules/web3';

import { getDVVaultWritableContract } from '../../contracts';
import { useTxModalStagesDVVWithdraw } from './use-dvv-withdraw-tx-modal';

export const useDVVWithdraw = (onRetry?: () => void) => {
  const { address } = useDappStatus();
  const { core, wstETH } = useLidoSDK();
  const { txModalStages } = useTxModalStagesDVVWithdraw();
  const txFlow = useTxFlow();

  const withdrawDVV = useCallback(
    async ({ amount }: { amount: bigint }) => {
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.dvvWithdrawStart);
      invariant(address, 'the address is required');

      try {
        const vault = getDVVaultWritableContract(
          core.rpcProvider,
          core.web3Provider as WalletClient,
        );

        // used to display in modal
        const willReceiveWstETH = await vault.read.previewRedeem([amount]);

        const withdrawArgs = [amount, address, address] as const; // shares, receiver, owner

        await txFlow({
          callsFn: async () => {
            const calls: AACall[] = [];
            calls.push({
              to: vault.address,
              data: encodeFunctionData({
                abi: vault.abi,
                functionName: 'redeem',
                args: withdrawArgs,
              }),
            });
            return calls;
          },
          sendTransaction: async (txStagesCallback) => {
            await core.performTransaction({
              getGasLimit: (opts) =>
                vault.estimateGas.redeem(withdrawArgs, opts),
              sendTransaction: (opts) => vault.write.redeem(withdrawArgs, opts),
              callback: txStagesCallback,
            });
          },
          onSign: async () => {
            return txModalStages.sign(amount, willReceiveWstETH);
          },
          onReceipt: async ({ txHashOrCallId, isAA }) => {
            return txModalStages.pending(
              amount,
              willReceiveWstETH,
              txHashOrCallId,
              isAA,
            );
          },
          onSuccess: async ({ txHash }) => {
            const wstETHBalance = await wstETH.balance(address);
            txModalStages.success(wstETHBalance, txHash);
            trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.dvvWithdrawFinish);
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

  return {
    withdrawDVV,
  };
};
