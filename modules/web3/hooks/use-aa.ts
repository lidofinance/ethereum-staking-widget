import { useCapabilities, useSendCalls } from 'wagmi/experimental';
import { useDappStatus } from './use-dapp-status';
import { useCallback } from 'react';
import {
  eip5792Actions,
  type GetCallsStatusReturnType,
} from 'viem/experimental';
import invariant from 'tiny-invariant';
import { useLidoSDK, useLidoSDKL2 } from '../web3-provider';
import { config } from 'config';
import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk';
import { Hash } from 'viem';

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

  const isAA = !!capabilities;

  const areAuxiliaryFundsSupported = !!(
    capabilities?.auxiliaryFunds &&
    capabilities.auxiliaryFunds.supported === true
  );

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

export const useSendAACalls = () => {
  const { sendCallsAsync } = useSendCalls();
  const { core: l1core } = useLidoSDK();
  const { core: l2core, isL2 } = useLidoSDKL2();
  const core = isL2 ? l2core : l1core;

  return useCallback(
    async (
      calls: unknown[],
      callback: (props: SendCallsStages) => Promise<void> = async () => {},
    ) => {
      try {
        invariant(core.web3Provider);
        const extendedWalletClient = core.web3Provider.extend(eip5792Actions());

        await callback({
          stage: TransactionCallbackStage.SIGN,
        });

        const callId = await sendCallsAsync({
          calls,
        });

        await callback({
          stage: TransactionCallbackStage.RECEIPT,
          callId,
        });

        const poll = async () => {
          const timeoutAt = Date.now() + config.AA_TX_POLLING_TIMEOUT;
          while (Date.now() < timeoutAt) {
            const callStatus = await extendedWalletClient
              .getCallsStatus({
                id: callId,
              })
              .catch(() => {
                // workaround for gnosis safe bug
                return { status: 'PENDING' } as const;
              });
            if (callStatus.status === 'CONFIRMED') {
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
