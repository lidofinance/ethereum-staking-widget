import invariant from 'tiny-invariant';
import { useCallback } from 'react';
import { encodeFunctionData, WalletClient } from 'viem';

import { getTokenAddress } from 'config/networks/token-address';
import { useDappStatus, useTxFlow, useLidoSDK } from 'modules/web3';
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

export const useGGVBulkWithdraw = (onRetry?: () => void) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesGGVBulkWithdraw();
  const txFlow = useTxFlow();

  const withdrawGGV = useCallback(
    async ({ amount }: GGVWithdrawalFormValidatedValues) => {
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvWithdrawStart);
      invariant(address, 'the address is required');

      try {
        const wethAddress = getTokenAddress(core.chainId, 'WETH');
        invariant(wethAddress, 'WETH address is required');

        const teller = getGGVTellerWritableContract(
          core.publicClient,
          core.walletClient as WalletClient,
        );
        const accountant = getGGVAccountantContract(core.publicClient);
        const vault = getGGVVaultContract(core.publicClient);

        // Read a fresh rate. The preview in the form can be old.
        const [rate, shareDecimals] = await Promise.all([
          accountant.read.getRateInQuoteSafe([wethAddress]),
          vault.read.decimals(),
        ]);
        const willReceive = getGGVAssetsOut(amount, rate, shareDecimals);
        const minimumAssets = getGGVMinimumAssetsOut(willReceive);

        // Teller burns shares from msg.sender, so no approve is necessary
        const withdrawArgs = [
          wethAddress,
          amount,
          minimumAssets,
          address,
        ] as const;

        await txFlow({
          callsFn: async () => [
            {
              to: teller.address,
              data: encodeFunctionData({
                abi: teller.abi,
                functionName: 'bulkWithdraw',
                args: withdrawArgs,
              }),
            },
          ],
          sendTransaction: async (txStagesCallback) => {
            await core.performTransaction({
              getGasLimit: (opts) =>
                teller.estimateGas.bulkWithdraw(withdrawArgs, opts),
              sendTransaction: (opts) =>
                teller.write.bulkWithdraw(withdrawArgs, opts),
              callback: txStagesCallback,
            });
          },
          onSign: async () => txModalStages.sign(amount, willReceive),
          onReceipt: async ({ txHashOrCallId, isAA }) =>
            txModalStages.pending(amount, willReceive, txHashOrCallId, isAA),
          onSuccess: async ({ txHash }) => {
            txModalStages.success(amount, txHash);
            trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvWithdrawFinish);
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
    [address, core, onRetry, txFlow, txModalStages],
  );

  return { withdrawGGV };
};
