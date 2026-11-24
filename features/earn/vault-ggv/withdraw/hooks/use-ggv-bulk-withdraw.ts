import invariant from 'tiny-invariant';
import { useCallback } from 'react';
import {
  encodeFunctionData,
  erc20Abi,
  type Address,
  type WalletClient,
} from 'viem';

import { getTokenAddress } from 'config/networks/token-address';
import {
  TransactionRevertedError,
  useDappStatus,
  useTxFlow,
  useLidoSDK,
} from 'modules/web3';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import {
  getGGVAccountantContract,
  getGGVTellerWritableContract,
  getGGVVaultContract,
} from '../../contracts';
import { getGGVAssetsOut, getGGVMinimumAssetsOut } from '../../utils';
import { useTxModalStagesGGVBulkWithdraw } from './use-ggv-bulk-withdraw-modal';
import type { GGVWithdrawalFormValidatedValues } from '../types';

const STEP = { withdraw: 'withdraw' } as const;

type BulkWithdrawData = {
  willReceive: bigint;
  withdrawArgs: readonly [Address, bigint, bigint, Address];
  // Undefined if the read failed. Then the success modal shows no amount.
  wethBalanceBefore?: bigint;
};

export const useGGVBulkWithdraw = (onRetry?: () => void) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesGGVBulkWithdraw();
  const txFlow = useTxFlow();

  const withdrawGGV = useCallback(
    async ({ amount }: GGVWithdrawalFormValidatedValues) => {
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvWithdrawStart);

      // The received amount is not known before the tx. It uses the rate at execution.
      const readWethBalance = (wethAddress: Address, account: Address) =>
        core.publicClient.readContract({
          address: wethAddress,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [account],
        });

      // Build inside the flow steps, so a failure goes to onFailure
      const getTeller = () =>
        getGGVTellerWritableContract(
          core.publicClient,
          core.walletClient as WalletClient,
        );

      const { isSuccess } = await txFlow<BulkWithdrawData>({
        // Read inside the flow. The flow stops here if the form unmounts.
        prepare: async () => {
          invariant(address, 'the address is required');
          const wethAddress = getTokenAddress(core.chainId, 'WETH');
          invariant(wethAddress, 'WETH address is required');

          // Read a fresh rate. The preview in the form can be old.
          const [rate, shareDecimals, wethBalanceBefore] = await Promise.all([
            getGGVAccountantContract(core.publicClient).read.getRateInQuoteSafe(
              [wethAddress],
            ),
            getGGVVaultContract(core.publicClient).read.decimals(),
            // Only for the success modal, so a failure must not stop the withdraw
            readWethBalance(wethAddress, address).catch(() => undefined),
          ]);
          const willReceive = getGGVAssetsOut(amount, rate, shareDecimals);

          return {
            willReceive,
            wethBalanceBefore,
            // Teller burns shares from msg.sender, so no approve is necessary
            withdrawArgs: [
              wethAddress,
              amount,
              getGGVMinimumAssetsOut(willReceive),
              address,
            ],
          };
        },
        callsFn: async ({ data }) => {
          const teller = getTeller();
          return [
            {
              stepId: STEP.withdraw,
              to: teller.address,
              data: encodeFunctionData({
                abi: teller.abi,
                functionName: 'bulkWithdraw',
                args: data.withdrawArgs,
              }),
            },
          ];
        },
        sendStep: async (_step, txStagesCallback, { data }) => {
          const teller = getTeller();
          await core.performTransaction({
            getGasLimit: (opts) =>
              teller.estimateGas.bulkWithdraw(data.withdrawArgs, opts),
            sendTransaction: (opts) =>
              teller.write.bulkWithdraw(data.withdrawArgs, opts),
            callback: txStagesCallback,
          });
        },
        onSign: async ({ ctx: { data } }) =>
          txModalStages.sign(amount, data.willReceive),
        onReceipt: async ({ txHashOrCallId, isAA, ctx: { data } }) =>
          txModalStages.pending(amount, data.willReceive, txHashOrCallId, isAA),
        onSuccess: async ({ txHash, ctx: { data } }) => {
          const wethAddress = data.withdrawArgs[0];
          const account = data.withdrawArgs[3];
          const wethBalanceAfter = await readWethBalance(
            wethAddress,
            account,
          ).catch(() => undefined);
          const received =
            data.wethBalanceBefore != null && wethBalanceAfter != null
              ? wethBalanceAfter - data.wethBalanceBefore
              : undefined;
          // A node behind the tx block gives no growth. Then show no amount.
          txModalStages.success(
            amount,
            received != null && received > 0n ? received : undefined,
            txHash,
          );
          trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvWithdrawFinish);
        },
        onMultisigDone: () => {
          txModalStages.successMultisig();
        },
        onFailure: async ({ error }) => {
          console.error(error);
          // A revert means the vault state changed, e.g. no WETH left.
          // A retry with the same data fails again, so do not offer it.
          const isReverted = error instanceof TransactionRevertedError;
          txModalStages.failed(error, isReverted ? undefined : onRetry);
        },
      });

      // Withdrawn or proposed to a multisig: the form resets
      return isSuccess;
    },
    [address, core, onRetry, txFlow, txModalStages],
  );

  return { withdrawGGV };
};
