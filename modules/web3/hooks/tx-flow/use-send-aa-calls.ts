import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useConnection } from 'wagmi';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';
import { config } from 'config';
// the concrete files, not the provider barrel: that one leads back here
import { useLidoSDK } from '../../web3-provider/lido-sdk';
import { useLidoSDKL2 } from '../../web3-provider/lido-sdk-l2';
import { SendCallsError, TxSentDataUnavailableError } from '../../utils/errors';
import { AACall, TxCallbackProps } from './types';

export const useSendAACalls = () => {
  const { address } = useConnection();
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
        const walletClient = core.walletClient;
        invariant(walletClient, 'Wallet client is undefined');

        await callback({
          stage: TransactionCallbackStage.SIGN,
        });

        const batch = calls
          .filter((call) => !!call)
          .map((call) => ({
            to: call.to,
            data: call.data,
            value: call.value,
          }));

        const callData = await walletClient.sendCalls({
          account: address ?? null,
          calls: batch,
          // Every batch here is a dependent one (unwrap or approve, then the
          // action) and the flow assumes all of it landed or none did: a
          // retry after a partial batch would redo the first call. So atomic
          // execution is required rather than preferred, which also stops the
          // fallback below from sending the calls as separate transactions
          forceAtomic: batch.length > 1,
          experimental_fallback: true, // fallback to legacy sendTransaction if sendCalls is not supported
        });

        await callback({
          stage: TransactionCallbackStage.RECEIPT,
          callId: callData.id,
        });

        const callStatus = await walletClient.waitForCallsStatus({
          id: callData.id,
          pollingInterval: config.PROVIDER_POLLING_INTERVAL,
          timeout: config.AA_TX_POLLING_TIMEOUT,
        });

        if (callStatus.status === 'failure') {
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

        // The wallet says the batch went through but gives nothing to find it
        // by: the outcome cannot be confirmed from here, which is not a failure
        if (!txHash) {
          throw new TxSentDataUnavailableError(
            new Error('Call status is success but carries no transaction hash'),
            callData.id,
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
    [address, core.walletClient],
  );
};
