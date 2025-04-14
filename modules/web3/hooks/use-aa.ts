import { useCallback } from 'react';
import invariant from 'tiny-invariant';
import { useCapabilities, useSendCalls } from 'wagmi/experimental';
import {
  eip5792Actions,
  type GetCallsStatusReturnType,
} from 'viem/experimental';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk';

import { useDappStatus } from './use-dapp-status';
import { useLidoSDK, useLidoSDKL2 } from '../web3-provider';
import { config } from 'config';

import type { Address, Hash } from 'viem';

const retry = (retryCount: number, error: object) => {
  if (
    'code' in error &&
    typeof error.code === 'number' &&
    error.code === -32601
  )
    return false;
  return retryCount <= 3;
};

export const useAA = () => {
  const { chainId } = useDappStatus();
  const capabilitiesQuery = useCapabilities({
    query: {
      retry,
    },
  });

  const capabilities =
    capabilitiesQuery.data && capabilitiesQuery.data[chainId];

  // use new AA flow only for batching supported accounts
  // because some wallets cannot handle non-atomic batching (e.g Ambire EOA)
  const isAA = !!capabilities?.atomicBatch?.supported;

  const areAuxiliaryFundsSupported = !!capabilities?.auxiliaryFunds?.supported;

  return {
    ...capabilitiesQuery,
    isAA,
    capabilities,
    areAuxiliaryFundsSupported,
  };
};

type SendCallsStages =
  | {
      stage: TransactionCallbackStage.SIGN;
    }
  | {
      stage: TransactionCallbackStage.RECEIPT;
      callId: string;
    }
  | {
      stage: TransactionCallbackStage.CONFIRMATION;
      callStatus: GetCallsStatusReturnType;
    }
  | {
      stage: TransactionCallbackStage.DONE;
      txHash: Hash;
    }
  | {
      stage: TransactionCallbackStage.ERROR;
      error: unknown;
    };

export class SendCallsError extends Error {}

export type AACall = { to: Address; data?: Hash; value?: bigint };

export const useSendAACalls = () => {
  const { sendCallsAsync } = useSendCalls();
  const { core: l1core } = useLidoSDK();
  const { core: l2core, isL2 } = useLidoSDKL2();
  const core = isL2 ? l2core : l1core;

  return useCallback(
    async (
      // falsish calls will be filtered out
      calls: (AACall | null | undefined | false)[],
      callback: (props: SendCallsStages) => Promise<void> = async () => {},
    ) => {
      try {
        invariant(core.web3Provider);
        const extendedWalletClient = core.web3Provider.extend(eip5792Actions());

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
            const callStatus = await extendedWalletClient.getCallsStatus({
              id: callData.id,
            });
            if (callStatus.status === 'success') {
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

        await callback({
          stage: TransactionCallbackStage.CONFIRMATION,
          callStatus,
        });

        if (
          callStatus.receipts?.find((receipt) => receipt.status === 'reverted')
        ) {
          throw new SendCallsError(
            'Some operation were reverted. Check your wallet for details.',
          );
        }

        // extract last receipt if there was no atomic batch
        const txHash = callStatus.receipts
          ? callStatus?.receipts[callStatus.receipts.length - 1].transactionHash
          : undefined;

        if (!txHash) {
          throw new SendCallsError('Could not locate tx hash');
        }

        await callback({
          stage: TransactionCallbackStage.DONE,
          txHash,
        });

        return { callStatus, txHash };
      } catch (error) {
        await callback({ stage: TransactionCallbackStage.ERROR, error });
        throw error;
      }
    },
    [core.web3Provider, sendCallsAsync],
  );
};
