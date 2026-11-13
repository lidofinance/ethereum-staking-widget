import invariant from 'tiny-invariant';
import { useCallback } from 'react';
import { encodeFunctionData, type Address, type WalletClient } from 'viem';

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
};

export const useGGVBulkWithdraw = (onRetry?: () => void) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesGGVBulkWithdraw();
  const txFlow = useTxFlow();

  const withdrawGGV = useCallback(
    async ({ amount }: GGVWithdrawalFormValidatedValues) => {
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvWithdrawStart);

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
          const [rate, shareDecimals] = await Promise.all([
            getGGVAccountantContract(core.publicClient).read.getRateInQuoteSafe(
              [wethAddress],
            ),
            getGGVVaultContract(core.publicClient).read.decimals(),
          ]);
          const willReceive = getGGVAssetsOut(amount, rate, shareDecimals);

          return {
            willReceive,
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
        onSuccess: async ({ txHash }) => {
          txModalStages.success(amount, txHash);
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
