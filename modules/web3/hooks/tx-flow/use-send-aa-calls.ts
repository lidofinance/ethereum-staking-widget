import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useSendCalls } from 'wagmi';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk';
import { config } from 'config';
import { useLidoSDK, useLidoSDKL2 } from '../../web3-provider';
import { AACall, TxCallbackProps } from './types';

export class SendCallsError extends Error {}

export const useSendAACalls = () => {
  const { sendCallsAsync } = useSendCalls();
  const { core: l1core } = useLidoSDK();
  const { core: l2core, isL2 } = useLidoSDKL2();
  const core = isL2 ? l2core : l1core;

  return useCallback(
    async (
      // falsish calls will be filtered out
      calls: (AACall | null | undefined | false)[],
      callback: (props: TxCallbackProps) => Promise<void> = async () => {},
    ) => {
      try {
        const walletClient = core.web3Provider;
        invariant(walletClient, 'Wallet client is undefined');

        await callback({
          stage: TransactionCallbackStage.SIGN,
        });

        const callData = await sendCallsAsync({
          calls: (calls.filter((call) => !!call) as AACall[]).map((call) => ({
            to: call.to,
            data: call.data,
            value: call.value,
          })),
        });

        await callback({
          stage: TransactionCallbackStage.RECEIPT,
          callId: callData.id,
        });

        const poll = async () => {
          const timeoutAt = Date.now() + config.AA_TX_POLLING_TIMEOUT;
          while (Date.now() < timeoutAt) {
            const callStatus = await walletClient.getCallsStatus({
              id: callData.id,
            });

            if (String(callStatus.status).toLowerCase() !== 'pending') {
              return callStatus;
            }
            await new Promise((resolve) =>
              setTimeout(resolve, config.PROVIDER_POLLING_INTERVAL),
            );
          }
          throw new SendCallsError(
            'Timeout for transaction confirmation exceeded.',
          );
        };

        const callStatus = await poll();

        if (String(callStatus.status).toLowerCase() === 'failure') {
          throw new SendCallsError(
            'Transaction failed. Check your wallet for details.',
          );
        }

        if (
          callStatus.receipts?.find((receipt) => receipt.status === 'reverted')
        ) {
          throw new SendCallsError(
            'Some operation were reverted. Check your wallet for details.',
          );
        }

        // extract last receipt if there was no atomic batch
        const txHash = callStatus.receipts
          ? callStatus?.receipts[callStatus.receipts.length - 1]
              ?.transactionHash
          : undefined;

        if (!txHash) {
          throw new SendCallsError(
            'Could not locate TX hash.Check your wallet for details.',
          );
        }

        await callback({
          stage: TransactionCallbackStage.DONE,
          txHash,
        });

        return { callStatus, txHash };
      } catch (error) {
        await callback({
          stage: TransactionCallbackStage.ERROR,
          error,
        });
        throw error;
      }
    },
    [core.web3Provider, sendCallsAsync],
  );
};
